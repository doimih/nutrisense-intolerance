import { redirect } from "next/navigation";

type VerifyAliasProps = {
  searchParams: { token?: string };
};

export default function VerifyAliasPage({ searchParams }: VerifyAliasProps) {
  const token = searchParams.token ? `?token=${encodeURIComponent(searchParams.token)}` : "";
  redirect(`/auth/verify${token}`);
}
