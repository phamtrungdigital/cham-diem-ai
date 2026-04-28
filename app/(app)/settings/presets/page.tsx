import Link from "next/link";
import Topbar from "@/components/app/Topbar";
import PresetsManager from "@/components/presets/PresetsManager";
import { listAllPresets } from "@/lib/presets/actions";

export const metadata = { title: "Mẫu thông tin bổ sung" };

export default async function PresetsPage() {
  const all = await listAllPresets();
  const score = all.filter((p) => p.scope === "score");
  const rewrite = all.filter((p) => p.scope === "rewrite");

  return (
    <>
      <Topbar
        crumbs={[
          { label: "Cài đặt", href: "/settings" },
          { label: "Mẫu thông tin" },
        ]}
      />
      <main className="flex-1 px-6 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[var(--color-text)]">
              Mẫu thông tin bổ sung
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Lưu các mẫu &ldquo;Thông tin bổ sung&rdquo; theo ngành để dùng
              lại — tách riêng cho phần Chấm điểm và phần Viết lại. Mỗi nhóm
              tối đa 20 mẫu.
            </p>
          </div>

          <PresetsManager initialScore={score} initialRewrite={rewrite} />

          <div className="mt-6 text-xs text-[var(--color-text-muted)]">
            <Link
              href="/settings"
              className="text-[var(--color-primary)] hover:underline"
            >
              ← Quay lại Cài đặt
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
