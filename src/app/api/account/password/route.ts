import { NextRequest, NextResponse } from "next/server";
import { updateCell } from "@/lib/googleSheets";
import { DIRECTORY_TAB, DIR_COLS } from "@/lib/sheetsSchema";
import { requireHousehold } from "@/lib/households";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const h = await requireHousehold(req);
    if (h instanceof NextResponse) return h;

    const { currentPassword, newPassword } = await req.json();
    if (String(h.row[DIR_COLS.password] ?? "").trim() !== String(currentPassword ?? "").trim()) {
      return NextResponse.json({ error: "Your current password isn't correct." }, { status: 401 });
    }
    const next = String(newPassword ?? "").trim();
    if (next.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
    }
    if (next.length > 64) {
      return NextResponse.json({ error: "New password is too long." }, { status: 400 });
    }

    await updateCell(DIRECTORY_TAB, `E${h.dirRowNum}`, next);

    // Notify the household (never include the password itself).
    await sendEmail({
      to: h.email,
      subject: "Your password was changed — Russell–Sharp Family Reunion",
      text: `Hi ${h.name},

The password for your household account at russellsharpfamily.com/my-invoice was just changed.

If you didn't make this change, please reply to this email right away.

— Russell–Sharp Family Reunion`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Password change error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
