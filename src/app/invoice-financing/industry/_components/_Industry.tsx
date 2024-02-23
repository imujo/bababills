"use client";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { api as apiServer } from "~/trpc/server";
import RadioGroup from "~/app/_components/RadioGroup/RadioGroup.component";
import useInvoiceFinancing from "~/app/_hooks/useInvoiceFinancing";

type IndustryProps = {
  initialData: Awaited<ReturnType<typeof apiServer.industry.getAll.query>>;
};

export default function Industry({ initialData }: IndustryProps) {
  const router = useRouter();
  const { data, error, isLoading } = api.industry.getAll.useQuery(undefined, {
    initialData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const { values, setValue } = useInvoiceFinancing();

  const onValueChange = (value: string) => {
    setValue("industryId", Number(value));
    router.push("/invoice-financing/company");
  };

  const items = data?.map((item) => ({
    label: item.label,
    value: item.id,
  }));

  if (data && items)
    return (
      <RadioGroup
        items={items}
        onValueChange={onValueChange}
        value={values.industryId?.toString()}
      />
    );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;
}