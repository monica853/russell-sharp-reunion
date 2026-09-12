"use client";

import { useState } from "react";

type Member = {
  name: string;
  relationship: string;
  ageGroup: string;
  tshirtSize: string;
};

const AGE_GROUPS = ["Under 5", "5–11", "12–17", "18–74", "75+"];
const SHIRT_SIZES = ["Youth S", "Youth M", "Youth L", "Adult S", "Adult M", "Adult L", "Adult XL", "Adult 2XL", "Adult 3XL"];

function emptyMember(): Member {
  return { name: "", relationship: "", ageGroup: "", tshirtSize: "" };
}

const inputClass =
  "w-full bg-transparent border border-[var(--gold)]/40 focus:border-[var(--gold)] focus:outline-none px-3 py-2 text-[var(--pearl)] placeholder:text-[var(--pearl-dim)]/50";
const labelClass = "block text-xs tracking-wide text-[var(--pearl-dim)] mb-1 font-heading";

export default function InterestForm() {
  const [members, setMembers] = useState<Member[]>([emptyMember()]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function updateMember(i: number, field: keyof Member, value: string) {
    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      primaryName: data.get("primary_name"),
      phone: data.get("phone"),
      email: data.get("email"),
      familyBranch: data.get("family_branch"),
      city: data.get("city"),
      state: data.get("state"),
      householdMembers: members,
      numAdults: data.get("num_adults"),
      numChildren: data.get("num_children"),
      lodgingNeeded: data.get("lodging_needed"),
      numRooms: data.get("num_rooms"),
      accessibilityDietary: data.get("accessibility_dietary"),
      activitiesInterest: data.get("activities_interest"),
    };

    try {
      const res = await fetch("/api/interest-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok) {
        setStatus("success");
        form.reset();
        setMembers([emptyMember()]);
      } else {
        setErrorMsg(json.error || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="card-plaque p-8 text-center">
        <p className="font-heading text-[var(--gold-bright)] text-xl mb-2">You&apos;re on the list!</p>
        <p className="text-[var(--pearl-dim)]">
          Thank you for joining the interest list. We&apos;ll be in touch with updates as planning moves forward.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <fieldset className="space-y-4">
        <legend className="font-heading text-[var(--gold-bright)] tracking-wide mb-2">Primary Contact</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full name</label>
            <input required name="primary_name" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Phone number</label>
            <input required name="phone" type="tel" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input required name="email" type="email" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Family branch</label>
            <select required name="family_branch" className={inputClass}>
              <option value="">Select one</option>
              <option>Russell</option>
              <option>Sharp</option>
              <option>Both / Not sure</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input required name="city" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input required name="state" className={inputClass} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-heading text-[var(--gold-bright)] tracking-wide mb-2">Household Members</legend>
        <p className="text-sm text-[var(--pearl-dim)] -mt-2">
          Include everyone in your household planning to attend, including yourself.
        </p>

        <div className="space-y-4">
          {members.map((m, i) => (
            <div key={i} className="card-plaque p-4 grid sm:grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  className={inputClass}
                  value={m.name}
                  onChange={(e) => updateMember(i, "name", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Relationship to you</label>
                <input
                  className={inputClass}
                  value={m.relationship}
                  onChange={(e) => updateMember(i, "relationship", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Age group</label>
                <select
                  className={inputClass}
                  value={m.ageGroup}
                  onChange={(e) => updateMember(i, "ageGroup", e.target.value)}
                >
                  <option value="">Select</option>
                  {AGE_GROUPS.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className={labelClass}>T-shirt size</label>
                  <select
                    className={inputClass}
                    value={m.tshirtSize}
                    onChange={(e) => updateMember(i, "tshirtSize", e.target.value)}
                  >
                    <option value="">Select</option>
                    {SHIRT_SIZES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setMembers((prev) => prev.filter((_, idx) => idx !== i))}
                    className="self-end text-[var(--oxblood)] hover:text-red-400 text-sm mb-2"
                    aria-label="Remove member"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setMembers((prev) => [...prev, emptyMember()])}
          className="btn-deco-outline text-sm"
        >
          + Add another household member
        </button>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-heading text-[var(--gold-bright)] tracking-wide mb-2">Headcount</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Number of adults</label>
            <input required name="num_adults" type="number" min={0} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Number of children</label>
            <input required name="num_children" type="number" min={0} className={inputClass} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-heading text-[var(--gold-bright)] tracking-wide mb-2">Lodging</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Will you need lodging?</label>
            <select required name="lodging_needed" className={inputClass}>
              <option value="">Select one</option>
              <option>Yes</option>
              <option>No</option>
              <option>Unsure</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Number of hotel rooms needed</label>
            <input name="num_rooms" type="number" min={0} className={inputClass} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-heading text-[var(--gold-bright)] tracking-wide mb-2">A Little More</legend>
        <div>
          <label className={labelClass}>Accessibility or dietary needs</label>
          <textarea name="accessibility_dietary" rows={3} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Activities you&apos;d like to see at the reunion</label>
          <textarea name="activities_interest" rows={3} className={inputClass} />
        </div>
      </fieldset>

      <div className="text-center pt-2">
        <button type="submit" disabled={status === "submitting"} className="btn-deco disabled:opacity-60">
          {status === "submitting" ? "Submitting…" : "Join the Interest List"}
        </button>
        {status === "error" && <p className="text-[var(--oxblood)] mt-3 text-sm">{errorMsg}</p>}
      </div>
    </form>
  );
}
