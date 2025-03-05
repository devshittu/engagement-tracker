export interface StatusItem {
  label: string;
  value: string | number;
}

/** Base fields shared by all variants. */
interface BaseProps {
  /** Page main heading title */
  title?: string;

  /** Optional date string to display */
  date?: string;

  /** Optional children for content area below statuses or description. */
  children?: React.ReactNode;

  /** Optional React node for page actions (e.g. buttons, toggles) at top-right. */
  pageActions?: React.ReactNode;
}

/** Variant: WithStatusData. 'kind' = 'status'. */
interface WithStatusData extends BaseProps {
  //   kind: 'status';
  status?: StatusItem[]; // We loop through these items
}

/** Variant: WithDescription. 'kind' = 'description'. */
interface WithDescription extends BaseProps {
  //   kind: 'description';
  description?: string; // Instead of status array
}

/**
 * The union type. We must pass exactly one variant:
 * either `kind: 'status'` with `status` array,
 * or `kind: 'description'` with `description`.
 */
export type DashboardPageFrameProps = WithStatusData | WithDescription;
