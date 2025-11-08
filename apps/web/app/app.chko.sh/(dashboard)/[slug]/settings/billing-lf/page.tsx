import PaymentMethodsLF from "./payment-methods-lf";
import PlanUsageLF from "./plan-usage-lf";

export default function WorkspaceBillingLF() {
  return (
    <div className="grid gap-8">
      <PlanUsageLF />
      <PaymentMethodsLF />
    </div>
  );
}
