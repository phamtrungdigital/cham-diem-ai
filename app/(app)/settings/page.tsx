import Topbar from "@/components/app/Topbar";
import AiKeysForm from "@/components/settings/AiKeysForm";
import { getAiCredentialsStatus } from "@/lib/ai/credentials";

export const metadata = { title: "Cài đặt" };

export default async function SettingsPage() {
  const status = await getAiCredentialsStatus();

  return (
    <>
      <Topbar
        crumbs={[
          { label: "Cài đặt", href: "/settings" },
          { label: "AI Provider" },
        ]}
      />
      <main className="flex-1 px-6 py-8 md:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[var(--color-text)]">
              AI Provider
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Kết nối API key của bạn để chấm điểm và tối ưu content. Hỗ trợ
              Anthropic Claude và OpenAI GPT.
            </p>
          </div>
          <AiKeysForm status={status} />
        </div>
      </main>
    </>
  );
}
