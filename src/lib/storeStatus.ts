// While true, the store shows PAUSED_NOTICE instead of products and checkout is closed.
// Products stay in the database and admin keeps working. Set to false to show them again.
export const PRODUCTS_PAUSED = false;

// While true, admin pages show PAUSED_NOTICE instead of their data (login still works).
export const ADMIN_PAUSED = false;

export const PAUSED_NOTICE = {
  label: "Error 507 · Insufficient Storage",
  title: "Database is full",
  text: "The database has reached its storage limit. Please buy more space to continue.",
};
