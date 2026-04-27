import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  createUserProfile,
  fetchUserProfile,
  updateCurrentUser,
  updateUserProfile,
} from "@features/settings/api/settingsApi";
import { HttpError } from "@shared/api/http";
import { getDisplayName, getSession, saveSession } from "@shared/auth/session";

type FormState = {
  name: string;
  position: string;
  subject: string;
  group: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
};

const emptyForm: FormState = {
  name: "",
  position: "Teacher",
  subject: "",
  group: "",
  city: "",
  province: "",
  postalCode: "",
  country: "",
  phone: "",
  currentPassword: "",
  newPassword: "",
};

function splitAddress(address: string): [string, string, string, string] {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return [parts[0] || "", parts[1] || "", parts[2] || "", parts[3] || ""];
}

function joinAddress(city: string, province: string, postalCode: string, country: string): string {
  return [city, province, postalCode, country].map((item) => item.trim()).filter(Boolean).join(", ");
}

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const session = getSession();
  const [form, setForm] = useState<FormState>({
    ...emptyForm,
    name: getDisplayName(session?.user),
    position: session?.user?.roles?.[0]?.name || "Teacher",
  });
  const [imagePath, setImagePath] = useState(session?.user?.userProfile?.image || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const apiBase = import.meta.env.VITE_API_BASE_URL?.trim() || "http://127.0.0.1:8000/api";
  const apiOrigin = apiBase.replace(/\/api\/?$/, "");

  const profileImageUrl = useMemo(() => {
    if (imagePreviewUrl) {
      return imagePreviewUrl;
    }

    if (!imagePath) {
      return null;
    }

    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://") ||
      imagePath.startsWith("data:") ||
      imagePath.startsWith("blob:")
    ) {
      return imagePath;
    }

    if (imagePath.startsWith("/")) {
      return `${apiOrigin}${imagePath}`;
    }

    if (imagePath.startsWith("storage/")) {
      return `${apiOrigin}/${imagePath}`;
    }

    return `${apiOrigin}/storage/${imagePath}`;
  }, [apiOrigin, imagePath, imagePreviewUrl]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setIsLoading(true);
      try {
        let profile;
        try {
          profile = await fetchUserProfile();
        } catch (error) {
          if (error instanceof HttpError && error.status === 404) {
            await createUserProfile();
            profile = await fetchUserProfile();
          } else {
            throw error;
          }
        }

        if (cancelled) {
          return;
        }

        const [city, province, postalCode, country] = splitAddress(profile.address || "");

        setForm((current) => ({
          ...current,
          city,
          province,
          postalCode,
          country,
          phone: profile.phone || "",
        }));
        setImagePath(profile.image || "");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load profile settings.";
        toast.error(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const trimmedName = form.name.trim() || "Teacher";
      const nameParts = trimmedName.split(" ").filter(Boolean);
      const firstName = nameParts.slice(0, -1).join(" ") || nameParts[0] || "";
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
      const fullAddress = joinAddress(form.city, form.province, form.postalCode, form.country);

      await Promise.all([
        updateCurrentUser({
          name: trimmedName,
          password: form.newPassword.trim() || undefined,
        }),
        updateUserProfile({
          firstName,
          lastName,
          phone: form.phone.trim(),
          address: fullAddress,
          imageFile,
        }),
      ]);

      const profile = await fetchUserProfile();
      setImagePath(profile.image || imagePath);
      setImageFile(null);
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImagePreviewUrl(null);
      setForm((current) => ({
        ...current,
        currentPassword: "",
        newPassword: "",
      }));

      const latestSession = getSession();
      if (latestSession) {
        saveSession({
          ...latestSession,
          user: {
            ...latestSession.user,
            name: trimmedName,
            userProfile: {
              ...latestSession.user.userProfile,
              first_name: profile.firstName,
              last_name: profile.lastName,
              phone: profile.phone || undefined,
              address: profile.address || undefined,
              image: profile.image || undefined,
            },
          },
        });
      }

      toast.success("Profile updated successfully.");
      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save profile.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-120px)] bg-slate-100 pb-10">
      <section className="mx-auto max-w-4xl px-4 py-10">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="px-6 py-7">
            <div className="mb-6 flex flex-col items-center">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={form.name || "Profile"}
                  className="h-28 w-28 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-200 text-2xl font-semibold text-slate-600">
                  {(form.name || "T")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase() ?? "")
                    .join("")}
                </div>
              )}
              <label className="mt-3 cursor-pointer text-sm text-slate-700 hover:text-indigo-600">
                Set New Profile
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            <div className="grid gap-4">
              <label className="space-y-1.5">
                <span className="text-sm text-slate-700">Your Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-indigo-400"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-sm text-slate-700">Position</span>
                <input
                  type="text"
                  value={form.position}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      position: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-indigo-400"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-sm text-slate-700">Subject</span>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        subject: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-indigo-400"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm text-slate-700">Group</span>
                  <input
                    type="text"
                    value={form.group}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        group: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-indigo-400"
                  />
                </label>
              </div>

              <div className="border-t border-slate-200 pt-2">
                <p className="mb-2 text-lg font-medium text-slate-800">Information</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-sm text-slate-700">City</span>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          city: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-indigo-400"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-sm text-slate-700">Province</span>
                    <input
                      type="text"
                      value={form.province}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          province: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-indigo-400"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-sm text-slate-700">Postal Code</span>
                    <input
                      type="text"
                      value={form.postalCode}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          postalCode: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-indigo-400"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-sm text-slate-700">Country</span>
                    <input
                      type="text"
                      value={form.country}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          country: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-indigo-400"
                    />
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2">
                <p className="mb-2 text-lg font-medium text-slate-800">Password Setting</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-sm text-slate-700">Current Password</span>
                    <input
                      type="password"
                      value={form.currentPassword}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          currentPassword: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-indigo-400"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-sm text-slate-700">New Password</span>
                    <input
                      type="password"
                      value={form.newPassword}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          newPassword: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-indigo-400"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
