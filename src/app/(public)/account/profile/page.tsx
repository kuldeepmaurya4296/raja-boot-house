"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";

export default function AccountProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [joinedAt, setJoinedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    setLoading(true);
    fetch("/api/user/profile")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load profile details");
        return res.json();
      })
      .then(data => {
        if (data.success && data.user) {
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          setPhone(data.user.phone || "");
          setJoinedAt(data.user.createdAt || "");
        }
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to load profile details.");
      })
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      if (data.success && data.user) {
        setName(data.user.name);
        setPhone(data.user.phone);
        
        // Refresh session
        await update();
        toast.success("Profile updated successfully!");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong while saving changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl animate-pulse space-y-6">
        <div className="h-8 w-32 bg-muted rounded"></div>
        <div className="bg-card border border-border rounded-xl p-6 space-y-6 h-[380px]"></div>
      </div>
    );
  }

  const initials = name
    ? name
        .split(" ")
        .filter(Boolean)
        .map(s => s[0])
        .join("")
        .toUpperCase()
    : "U";

  const memberYear = joinedAt ? new Date(joinedAt).getFullYear() : new Date().getFullYear();

  return (
    <div className="max-w-xl">
      <h2 className="font-serif text-2xl font-bold mb-6">Profile</h2>
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-card">
        <div className="flex items-center gap-4 pb-5 border-b border-border">
          <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground grid place-items-center font-serif text-xl font-bold">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-lg">{name}</p>
            <p className="text-sm text-muted-foreground">Member since {memberYear}</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full name</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1.5 w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</span>
            <input
              type="email"
              value={email}
              disabled
              className="mt-1.5 w-full bg-muted border border-input rounded-lg px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mobile Number / Phone</span>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. +91 9876543210"
              className="mt-1.5 w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
            />
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-50 hover:bg-primary/95 transition-colors"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="bg-background border border-input text-foreground hover:bg-muted rounded-full px-6 py-2.5 text-sm font-semibold cursor-pointer transition-colors"
          >
            Sign out
          </button>
        </div>
      </form>
    </div>
  );
}

