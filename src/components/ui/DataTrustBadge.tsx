interface DataTrustBadgeProps {
  isDemoData?: boolean;
  verificationStatus?: "DEMO" | "UNVERIFIED" | "PENDING_VERIFICATION" | "VERIFIED";
}

export default function DataTrustBadge({ isDemoData, verificationStatus }: DataTrustBadgeProps) {
  if (isDemoData || !verificationStatus || verificationStatus === "DEMO") {
    return (
      <span className="badge badge-demo" role="note" aria-label="Preview data — not independently verified">
        Preview data
      </span>
    );
  }

  if (verificationStatus === "UNVERIFIED") {
    return (
      <span className="badge badge-demo" role="note" aria-label="Data not yet verified">
        Data not yet verified
      </span>
    );
  }

  if (verificationStatus === "PENDING_VERIFICATION") {
    return (
      <span className="badge badge-demo" role="note" aria-label="Data pending verification">
        Data pending verification
      </span>
    );
  }

  return null;
}
