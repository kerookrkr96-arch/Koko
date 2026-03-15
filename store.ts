import { User, Product, Sale, InvoiceSale, InstantSale, Return, Customer, DeferredSale, Settings } from './types';

const getItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Default admin user
const defaultUsers: User[] = [
  { id: '1', username: '1234', password: '1234', name: 'المدير', role: 'admin', createdAt: new Date().toISOString() }
];

const defaultSettings: Settings = {
  companyName: 'مؤسسة كيرو للأدوات الصحية',
  companyLogo: '',
  invoiceBackground: '',
  invoiceTemplate: 'default',
  registrationNumber: '',
};

// Users
export const getUsers = (): User[] => getItem('kiro_users', defaultUsers);
export const setUsers = (users: User[]) => setItem('kiro_users', users);
export const addUser = (user: Omit<User, 'id' | 'createdAt'>): User => {
  const users = getUsers();
  const newUser: User = { ...user, id: generateId(), createdAt: new Date().toISOString() };
  users.push(newUser);
  setUsers(users);
  return newUser;
};
export const updateUser = (id: string, data: Partial<User>) => {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx !== -1) { users[idx] = { ...users[idx], ...data }; setUsers(users); }
  return users;
};
export const deleteUser = (id: string) => {
  const users = getUsers().filter(u => u.id !== id);
  setUsers(users);
  return users;
};

// Auth
export const getAuthUser = (): User | null => getItem('kiro_auth', null);
export const setAuthUser = (user: User | null) => setItem('kiro_auth', user);
export const login = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) setAuthUser(user);
  return user || null;
};
export const logout = () => setAuthUser(null);

// Products
export const getProducts = (): Product[] => getItem('kiro_products', []);
export const setProducts = (products: Product[]) => setItem('kiro_products', products);
export const addProduct = (product: Omit<Product, 'id' | 'qrCode' | 'createdAt' | 'updatedAt'>): Product => {
  const products = getProducts();
  const id = generateId();
  const newProduct: Product = {
    ...product,
    id,
    qrCode: id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  products.push(newProduct);
  setProducts(products);
  return newProduct;
};
export const updateProduct = (id: string, data: Partial<Product>) => {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx !== -1) { products[idx] = { ...products[idx], ...data, updatedAt: new Date().toISOString() }; setProducts(products); }
  return products;
};
export const deleteProduct = (id: string) => {
  const products = getProducts().filter(p => p.id !== id);
  setProducts(products);
  return products;
};
export const deductStock = (items: { productName: string; quantity: number }[]) => {
  const products = getProducts();
  items.forEach(item => {
    const idx = products.findIndex(p => p.name === item.productName);
    if (idx !== -1) products[idx].quantity = Math.max(0, products[idx].quantity - item.quantity);
  });
  setProducts(products);
};
export const restoreStock = (items: { productName: string; quantity: number }[]) => {
  const products = getProducts();
  items.forEach(item => {
    const idx = products.findIndex(p => p.name === item.productName);
    if (idx !== -1) products[idx].quantity += item.quantity;
  });
  setProducts(products);
};

// Sales
export const getSales = (): Sale[] => getItem('kiro_sales', []);
export const setSales = (sales: Sale[]) => setItem('kiro_sales', sales);
export const addSale = (sale: Omit<Sale, 'id' | 'date'>): Sale => {
  const sales = getSales();
  const newSale: Sale = { ...sale, id: generateId(), date: new Date().toISOString() };
  sales.push(newSale);
  setSales(sales);
  deductStock(sale.items);
  return newSale;
};
export const deleteSale = (id: string, restore = true) => {
  const sales = getSales();
  const sale = sales.find(s => s.id === id);
  if (sale && restore) restoreStock(sale.items);
  setSales(sales.filter(s => s.id !== id));
};

// Invoices
export const getInvoices = (): InvoiceSale[] => getItem('kiro_invoices', []);
export const setInvoices = (invoices: InvoiceSale[]) => setItem('kiro_invoices', invoices);
export const addInvoice = (invoice: Omit<InvoiceSale, 'id' | 'date'>, archive = false): InvoiceSale => {
  const invoices = getInvoices();
  const newInvoice: InvoiceSale = { ...invoice, id: generateId(), date: new Date().toISOString(), archived: archive };
  invoices.push(newInvoice);
  setInvoices(invoices);
  if (!archive) deductStock(invoice.items);
  return newInvoice;
};
export const deleteInvoice = (id: string) => {
  const invoices = getInvoices();
  const inv = invoices.find(i => i.id === id);
  if (inv && !inv.archived) restoreStock(inv.items);
  setInvoices(invoices.filter(i => i.id !== id));
};

// Instant Sales
export const getInstantSales = (): InstantSale[] => getItem('kiro_instant_sales', []);
export const setInstantSales = (sales: InstantSale[]) => setItem('kiro_instant_sales', sales);
export const addInstantSale = (sale: Omit<InstantSale, 'id' | 'date'>): InstantSale => {
  const sales = getInstantSales();
  const newSale: InstantSale = { ...sale, id: generateId(), date: new Date().toISOString() };
  sales.push(newSale);
  setInstantSales(sales);
  deductStock(sale.items);
  return newSale;
};
export const deleteInstantSale = (id: string) => {
  const sales = getInstantSales();
  const sale = sales.find(s => s.id === id);
  if (sale) restoreStock(sale.items);
  setInstantSales(sales.filter(s => s.id !== id));
};

// Returns
export const getSalesReturns = (): Return[] => getItem('kiro_sales_returns', []);
export const setSalesReturns = (returns: Return[]) => setItem('kiro_sales_returns', returns);
export const addSalesReturn = (ret: Omit<Return, 'id' | 'date'>): Return => {
  const returns = getSalesReturns();
  const newReturn: Return = { ...ret, id: generateId(), date: new Date().toISOString() };
  returns.push(newReturn);
  setSalesReturns(returns);
  restoreStock(ret.items);
  return newReturn;
};
export const deleteSalesReturn = (id: string) => {
  setSalesReturns(getSalesReturns().filter(r => r.id !== id));
};

export const getInvoiceReturns = (): Return[] => getItem('kiro_invoice_returns', []);
export const setInvoiceReturns = (returns: Return[]) => setItem('kiro_invoice_returns', returns);
export const addInvoiceReturn = (ret: Omit<Return, 'id' | 'date'>): Return => {
  const returns = getInvoiceReturns();
  const newReturn: Return = { ...ret, id: generateId(), date: new Date().toISOString() };
  returns.push(newReturn);
  setInvoiceReturns(returns);
  restoreStock(ret.items);
  return newReturn;
};
export const deleteInvoiceReturn = (id: string) => {
  setInvoiceReturns(getInvoiceReturns().filter(r => r.id !== id));
};

// Deferred Sales
export const getDeferredSales = (): DeferredSale[] => getItem('kiro_deferred_sales', []);
export const setDeferredSales = (sales: DeferredSale[]) => setItem('kiro_deferred_sales', sales);
export const addDeferredSale = (sale: Omit<DeferredSale, 'id' | 'date'>): DeferredSale => {
  const sales = getDeferredSales();
  const newSale: DeferredSale = { ...sale, id: generateId(), date: new Date().toISOString() };
  sales.push(newSale);
  setDeferredSales(sales);
  deductStock(sale.items);
  return newSale;
};
export const addDeferredPayment = (saleId: string, amount: number, note: string) => {
  const sales = getDeferredSales();
  const idx = sales.findIndex(s => s.id === saleId);
  if (idx !== -1) {
    sales[idx].payments.push({ id: generateId(), amount, date: new Date().toISOString(), note });
    sales[idx].amountPaid += amount;
    sales[idx].amountRemaining = sales[idx].total - sales[idx].amountPaid;
    sales[idx].status = sales[idx].amountRemaining <= 0 ? 'paid' : 'partial';
    setDeferredSales(sales);
  }
};

// Customers
export const getCustomers = (): Customer[] => getItem('kiro_customers', []);
export const setCustomers = (customers: Customer[]) => setItem('kiro_customers', customers);
export const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases' | 'totalDebt' | 'payments'>): Customer => {
  const customers = getCustomers();
  const newCustomer: Customer = { ...customer, id: generateId(), totalPurchases: 0, totalDebt: 0, payments: [], createdAt: new Date().toISOString() };
  customers.push(newCustomer);
  setCustomers(customers);
  return newCustomer;
};
export const updateCustomer = (id: string, data: Partial<Customer>) => {
  const customers = getCustomers();
  const idx = customers.findIndex(c => c.id === id);
  if (idx !== -1) { customers[idx] = { ...customers[idx], ...data }; setCustomers(customers); }
  return customers;
};
export const deleteCustomer = (id: string) => {
  setCustomers(getCustomers().filter(c => c.id !== id));
};
export const addCustomerPayment = (customerId: string, amount: number, note: string) => {
  const customers = getCustomers();
  const idx = customers.findIndex(c => c.id === customerId);
  if (idx !== -1) {
    customers[idx].payments.push({ id: generateId(), amount, date: new Date().toISOString(), note });
    customers[idx].totalDebt = Math.max(0, customers[idx].totalDebt - amount);
    setCustomers(customers);
  }
};

// Settings
export const getSettings = (): Settings => getItem('kiro_settings', defaultSettings);
export const setSettings = (settings: Settings) => setItem('kiro_settings', settings);

// Export/Import
export const exportAllData = () => {
  return JSON.stringify({
    users: getUsers(),
    products: getProducts(),
    sales: getSales(),
    invoices: getInvoices(),
    instantSales: getInstantSales(),
    salesReturns: getSalesReturns(),
    invoiceReturns: getInvoiceReturns(),
    deferredSales: getDeferredSales(),
    customers: getCustomers(),
    settings: getSettings(),
    exportDate: new Date().toISOString(),
  });
};

export const importAllData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.users) setUsers(data.users);
    if (data.products) setProducts(data.products);
    if (data.sales) setSales(data.sales);
    if (data.invoices) setInvoices(data.invoices);
    if (data.instantSales) setInstantSales(data.instantSales);
    if (data.salesReturns) setSalesReturns(data.salesReturns);
    if (data.invoiceReturns) setInvoiceReturns(data.invoiceReturns);
    if (data.deferredSales) setDeferredSales(data.deferredSales);
    if (data.customers) setCustomers(data.customers);
    if (data.settings) setSettings(data.settings);
    return true;
  } catch {
    return false;
  }
};
