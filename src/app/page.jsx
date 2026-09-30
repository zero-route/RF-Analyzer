import Shell from "@/components/layout/Shell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function Page() {
  return (
    <Shell
      sidebar={
        <Card title="Input">
          <p className="text-sm text-muted">Kontrol daya, antena, dan kabel akan tampil di sini.</p>
        </Card>
      }
    >
      <Card title="EIRP" action={<Badge tone="safe">Aman</Badge>}>
        <p className="num text-5xl font-light tracking-tight">
          20.0 <span className="text-2xl text-faint">dBm</span>
        </p>
      </Card>
    </Shell>
  );
}
