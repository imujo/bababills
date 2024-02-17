"use client";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import RadioGroup from "~/app/_components/RadioGroup/RadioGroup.component";
import useInvoiceFinancing from "~/app/_hooks/useInvoiceFinancing";
import FlowLayout from "~/app/_components/FlowLayout";

export default function Turnover() {
  const router = useRouter();
  const { data, error, isLoading } = api.annualTurnoverGBP.getAll.useQuery();
  const { values, setValue } = useInvoiceFinancing();

  const onValueChange = (value: string) => {
    setValue("turnoverId", Number(value));
    router.push("/invoice-financing/industry");
  };

  const items = data?.map((item) => ({
    label: item.label,
    value: item.id,
  }));

  if (data && items)
    return (
      <FlowLayout backUrl="">
        <div className="w-full">
          <h2 className="mb-8 text-center text-lg text-primary">
            What&apos;s your annual turnover?
          </h2>
          <RadioGroup
            items={items}
            onValueChange={onValueChange}
            value={values.turnoverId?.toString()}
          />
        </div>
      </FlowLayout>
    );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;
}
