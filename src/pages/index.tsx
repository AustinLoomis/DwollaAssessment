import * as React from "react";
import Head from 'next/head';
import useSWR from 'swr';
// ADDED: Importing additional Material-UI components needed for the enhanced UI
import { 
  Box, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { AddRounded } from '@mui/icons-material';

export type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  businessName?: string;
};

export type Customers = Customer[];
export type ApiError = { code: string; message: string };

const Home = () => {
  // STATE MANAGEMENT ADDITIONS:
  // Dialog open/close state
  const [open, setOpen] = React.useState(false);
  // Form state (excluding email which is managed separately)
  const [newCustomer, setNewCustomer] = React.useState<Omit<Customer, "email">>({
    firstName: "",
    lastName: "", 
    businessName: "" // Optional field
  });
  // Email input state
  const [email, setEmail] = React.useState("");
  // Email validation error
  const [emailError, setEmailError] = React.useState("");

  // Original data fetching logic remains the same
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    const body = await response.json();
    if (!response.ok) throw body;
    return body;
  };

  // SWR USAGE:
  // Added mutate function to refresh data after additions
  const { data, error, isLoading, mutate } = useSWR<Customers, ApiError>(
    '/api/customers',
    fetcher
  );

  // NEW DIALOG CONTROL FUNCTIONS:
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    // Reset all form fields when closing dialog
    setNewCustomer({ firstName: "", lastName: "", businessName: "" });
    setEmail("");
    setEmailError("");
  };

  // NEW FORM HANDLERS:
  // Generic input change handler for text fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({ ...prev, [name]: value }));
  };

  // Email validation helper
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // NEW FORM SUBMISSION LOGIC:
  const handleAddCustomer = async () => {
    // Validate email format
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    try {
      // POST new customer data to API
      const response = await fetch('/api/customers', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...newCustomer, // Includes firstName, lastName, businessName
          email 
        }),
      });
      
      if (!response.ok) throw await response.json();
      
      // Refresh customer list and close dialog
      mutate(); // SWR revalidation
      handleClose();
    } catch (err) {
      console.error("Failed to add customer:", err);
    }
  };

  return (
    <>
      <Head>
        <title>Dwolla | Customers</title>
      </Head>
      <main>
        {/* COMPLETELY REDESIGNED UI CONTAINER */}
        {/* Original had just a simple Box with unordered list */}
        <Box sx={{ p: 3 }}> {/* Added padding for better spacing */}
          {/* Enhanced loading and error states using Typography */}
          {isLoading && <Typography>Loading...</Typography>}
          {error && <Typography color="error">Error: {error.message}</Typography>}
          
          {data && (
            <TableContainer 
              component={Paper} 
              // Custom styling for table container:
              sx={{ 
                width: '100%', // Full width
                maxWidth: 800,  // But not wider than 800px
                margin: '0 auto', // Centered
                boxShadow: 'none', // Subtle flat design
                border: '1px solid',
                borderColor: 'divider', // Matching MUI theme
                borderRadius: 1 // Slightly rounded corners
              }}
            >
              {/* TABLE IMPLEMENTATION (REPLACED SIMPLE LIST) */}
              <Table sx={{ 
                tableLayout: 'fixed', // Consistent column widths
                '& .MuiTableCell-root': { 
                  py: 1.5 // Cell padding adjustment
                }
              }}>
                <TableHead>
                  {/* HEADER ROW WITH CUSTOMER COUNT AND ADD BUTTON */}
                  <TableRow>
                    <TableCell colSpan={2} sx={{ borderBottom: "none", pb: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {/* Dynamic customer count with proper pluralization */}
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {data.length} {data.length === 1 ? "Customer" : "Customers"}
                        </Typography>
                        {/* ADD CUSTOMER BUTTON (NEW) */}
                        <Button
                          variant="contained"
                          endIcon={<AddRounded />} // Icon on right
                          onClick={handleClickOpen}
                          size="small"
                          sx={{ 
                            ml: "auto", // Pushes button to right
                            pl: 2, pr: 1.5, // Padding
                            textTransform: 'none' // Preserves case
                          }}
                        >
                          Add Customer
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                  {/* COLUMN HEADERS */}
                  <TableRow sx={{ "& th": { 
                    borderTop: "none", // Removes line above headers
                    fontWeight: 600 // Bold headers
                  } }}>
                    <TableCell sx={{ width: '50%' }}>Name</TableCell>
                    <TableCell sx={{ width: '50%' }}>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* DYNAMIC TABLE ROWS (REPLACED SIMPLE LIST ITEMS) */}
                  {data.map((customer) => (
                    <TableRow 
                      key={customer.email}
                    >
                      <TableCell component="th" scope="row">
                        {/* BUSINESS NAME DISPLAY LOGIC: */}
                        {/* Shows business name if exists, otherwise shows full name */}
                        {customer.businessName || `${customer.firstName} ${customer.lastName}`}
                      </TableCell>
                      <TableCell sx={{ 
                        color: 'primary.main',
                        wordBreak: 'break-word' // Handles long emails (wraps)
                      }}>
                        {customer.email}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* NEW ADD CUSTOMER DIALOG */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Add Customer</DialogTitle>
          <DialogContent>
            {/* FORM LAYOUT WITH VALIDATION */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              {/* FIRST ROW: NAME FIELDS */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                {/* FIRST NAME FIELD */}
                <TextField
                  autoFocus
                  required
                  margin="dense"
                  name="firstName"
                  label="First Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newCustomer.firstName}
                  onChange={handleInputChange}
                  error={!newCustomer.firstName}
                  helperText={!newCustomer.firstName ? "Required" : ""}
                />
                {/* LAST NAME FIELD */}
                <TextField
                  required
                  margin="dense"
                  name="lastName"
                  label="Last Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newCustomer.lastName}
                  onChange={handleInputChange}
                  error={!newCustomer.lastName}
                  helperText={!newCustomer.lastName ? "Required" : ""}
                />
                {/* BUSINESS NAME FIELD (OPTIONAL) */}
                <TextField
                  margin="dense"
                  name="businessName"
                  label="Business Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newCustomer.businessName || ''}
                  onChange={handleInputChange}
                />
              </Box>
              {/* SECOND ROW: EMAIL FIELD */}
              <TextField
                required
                margin="dense"
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(''); // Clear error on typing
                }}
                error={!!emailError || !email}
                helperText={
                  emailError 
                    ? emailError // Show format error if exists
                    : !email 
                      ? "Required" // Show required if empty
                      : ""
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            {/* SUBMIT BUTTON - DISABLED UNTIL FORM IS VALID */}
            <Button 
              onClick={handleAddCustomer} 
              variant="contained"
              disabled={
                !newCustomer.firstName || 
                !newCustomer.lastName || 
                !email || 
                !validateEmail(email)
              }
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </main>
    </>
  );
};

export default Home;
