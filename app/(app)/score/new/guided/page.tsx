import Link from "next/link";
import Topbar from "@/components/app/Topbar";
import GuidedScoreForm from "@/components/score/GuidedScoreForm";
import { getAiCredentialsStatus } from "@/lib/ai/credentials";
import { listPresets } from "@/lib/presets/actions";

export const metadata = { title: "Chấm điểm có hướng dẫn" };

export default async function GuidedScorePage() {
  const status = await getAiCredentialsStatus();
  const provider = status.defaultProvider;
  const hasKey =
    provider === "anthropic" ? status.anthropic.hasKey : status.openai.hasKey;
  const presets = await listPresets("score");

  return (
    <>
      <Topbar
        crumbs={[
          { label: "Chấm điểm", href: "/score/new" },
          { label: "Có hướng dẫn" },
        ]}
      />
      <main className="flex-1 px-6 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[var(--color-text)]">
              Chấm điểm có hướng dẫn
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              4 bước nhanh — anh khai đầy đủ context (sản phẩm, USP, offer,
              bằng chứng) để AI chấm điểm và viết lại sát với thực tế hơn.
            </p>
          </div>

          {!hasKey && (
            <div className="mb-5 rounded-[12px] border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-sm text-[#92400e]">
              Bạn chưa có API key cho{" "}
              <strong>
                {provider === "anthropic" ? "Anthropic" : "OpenAI"}
              </strong>
              .{" "}
              <Link
                href="/settings"
                className="font-semibold text-[var(--color-primary)] hover:underline"
              >
                Vào Cài đặt để thêm key →
              </Link>
            </div>
          )}

          <GuidedScoreForm presets={presets} />
        </div>
      </main>
    </>
  );
}
