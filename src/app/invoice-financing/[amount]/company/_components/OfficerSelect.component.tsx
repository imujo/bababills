"use client";
import { sendGTMEvent } from "@next/third-parties/google";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import Button from "~/app/_components/Button.component";
import CompanyList from "~/app/_components/CompanyList/CompanyList.component";
import CompanyListItem, {
  CompanyListItemProps,
} from "~/app/_components/CompanyList/CompanyListItem.component";
import Input from "~/app/_components/Input.component";
import useInvoiceFinancing, {
  PageEnum,
} from "~/app/_hooks/useInvoiceFinancing";
import { api } from "~/trpc/react";

export default function OfficerSelect({ amount }: { amount: number }) {
  const { data: invoiceFinancingState, setData: setInvoiceFinancingState } =
    useInvoiceFinancing(PageEnum.Company, amount);
  const [nameAvailable, setNameAvailable] = useState(true);
  const [selectedOfficerId, setSelectedOfficerId] = useState<
    string | undefined
  >(invoiceFinancingState.fullName ?? undefined);

  const {
    data: dataOfficers,
    isLoading: isLoadingOfficers,
    error: errorOfficers,
  } = api.companyApi.getOfficers.useQuery({
    companyNumber: invoiceFinancingState.companyNumber ?? "",
  });

  const officers: CompanyListItemProps[] =
    dataOfficers?.map((officer, index) => {
      const subtitle =
        officer.date_of_birth?.month && officer.date_of_birth.year
          ? format(
              new Date(
                officer.date_of_birth.year,
                officer.date_of_birth.month,
                1,
              ),
              "MM/yyyy",
            )
          : "";

      return {
        id: officer.name + index,
        title: officer.name,
        subtitle,
      };
    }) ?? [];

  const onOfficersSelect = (value: string) => {
    const officer = officers.find((o) => o.id === value);
    setSelectedOfficerId(value);
    setInvoiceFinancingState("fullName", officer?.title ?? null);
  };

  return (
    <>
      <div>
        <button
          onClick={() => {
            setInvoiceFinancingState("companyNumber", null);
            setInvoiceFinancingState("companyName", null);
            setInvoiceFinancingState("companyStatus", undefined);
            setInvoiceFinancingState("address", undefined);
            setInvoiceFinancingState("companyType", undefined);
            setInvoiceFinancingState("postalCode", undefined);
            setInvoiceFinancingState("tenureId", null);
            setInvoiceFinancingState("fullName", null);
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <CompanyListItem
          id={invoiceFinancingState.companyNumber ?? "-1"}
          title={invoiceFinancingState.companyName ?? "Error"}
          subtitle={invoiceFinancingState.companyNumber ?? ""}
          selected
          className="pt-0"
        />
      </div>
      <h3 className="mb-1 mt-4 font-medium">
        Who&apos;s applying for finance?
      </h3>
      {(!isLoadingOfficers && officers.length === 0) || !nameAvailable ? (
        <Input
          value={invoiceFinancingState.fullName || undefined}
          onChange={(e) => setInvoiceFinancingState("fullName", e.target.value)}
          id="officers-input"
          label="Full name"
          placeholder="Jane Smith"
        />
      ) : (
        <>
          <CompanyList
            isLoading={isLoadingOfficers}
            items={officers}
            selectedId={(item) =>
              selectedOfficerId ? item.id.startsWith(selectedOfficerId) : false
            }
            onItemClick={(value) => {
              onOfficersSelect(value);
              sendGTMEvent({
                event: "invoice_finance_director_select",
                value: "invoice_finance_director_select",
              });
            }}
            error={errorOfficers?.message}
            numOfLoadingItems={3}
          />
          <Button
            variant={"underline"}
            onClick={() => {
              sendGTMEvent({
                event: "invoice_finance_director_not_there",
                value: "invoice_finance_director_not_there",
              });
              setInvoiceFinancingState("fullName", null);
              setNameAvailable(false);
            }}
          >
            Not there?
          </Button>
        </>
      )}
    </>
  );
}
