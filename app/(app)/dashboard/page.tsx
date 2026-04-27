import Topbar from "@/components/app/Topbar";
import KpiCard from "@/components/app/KpiCard";
import EmptyState from "@/components/app/EmptyState";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const name = (user?.user_metadata?.name as string | undefined)?.split(" ")[0];

  const kpis = [
    { label: "Tổng lượt chấm", value: "0", hint: "Bắt đầu với content đầu tiên" },
    { label: "Điểm trung bình", value: "—", hint: "Cần ít nhất 1 lượt chấm" },
    { label: "CTR Potential TB", value: "—", hint: "Sẽ hiện sau khi có dữ liệu" },
    { label: "Nội dung tốt", value: "0", hint: "Điểm 80+ được tính tốt" },
  ];

  return (
    <>
      <Topbar crumbs={[{ label: "Dashboard" }]} />
      <main className="flex-1 px-6 py-8 md:px-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[var(--color-text)]">
            Chào {name ?? "bạn"} 👋
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Tổng quan chất lượng content và truy cập nhanh vào flow chấm điểm.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} {...k} />
          ))}
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">
              Phân tích gần đây
            </h2>
          </div>
          <EmptyState
            title="Bạn chưa chấm điểm content nào"
            description="Dán content Facebook Ads đầu tiên để AI phân tích, gợi ý tối ưu và tăng CTR."
            ctaLabel="Chấm điểm content mới"
            ctaHref="/score/new"
          />
        </section>
      </main>
    </>
  );
}
