# NAMECARD.MY - DISTRIBUTOR SYSTEM DESIGN

## 🌍 GLOBAL DISTRIBUTOR NETWORK ARCHITECTURE

### BUSINESS MODEL OVERVIEW:
- **Multi-tier subscription pricing** with distributor discount codes
- **Global distribution network** with regional partners
- **Automated commission system** with real-time tracking
- **Web-based management platform** for distributors
- **Admin dashboard** for platform oversight

---

## 💰 PRICING & COMMISSION STRUCTURE

### SUBSCRIPTION TIERS:

| Tier | Market Price | With Code (50% off) | Distributor Profit |
|------|-------------|---------------------|-------------------|
| **Pro** | RM199/year | RM99/year | RM40 |
| **Enterprise** | RM599/year | RM299/year | RM100 |

### COMMISSION CALCULATION:
```
Market Price = RM199
Discount Code = 50% off = RM99 (customer pays)
Platform Revenue = RM99 - RM40 = RM59
Distributor Commission = RM40
```

### WITHDRAWAL SYSTEM:
- **Minimum Withdrawal**: RM100
- **Platform Fee**: 5% of withdrawal amount
- **Payout Methods**: Bank transfer, PayPal, Wise
- **Processing Time**: 3-5 business days

---

## 🏢 DISTRIBUTOR WEB DASHBOARD

### DASHBOARD OVERVIEW:
```
┌─────────────────────────────────────────────────────┐
│ NAMECARD.MY DISTRIBUTOR PORTAL             [Profile]│
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📊 OVERVIEW                                        │
│ ┌─────────────┬─────────────┬─────────────────────┐ │
│ │ BALANCE     │ THIS MONTH  │ TOTAL EARNINGS      │ │
│ │ RM 245.50   │ RM 120.00   │ RM 1,850.00         │ │
│ └─────────────┴─────────────┴─────────────────────┘ │
│                                                     │
│ 📈 SALES PERFORMANCE                               │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Pro Sales: 3 this month (RM120 commission)     │ │
│ │ Enterprise Sales: 0 this month                  │ │
│ │ Conversion Rate: 15% (3 sales / 20 clicks)     │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ 🔗 YOUR DISTRIBUTOR CODE                           │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Code: DIST-MY-001                               │ │
│ │ Usage: namecardmy.com/signup?code=DIST-MY-001   │ │
│ │ [📋 Copy Link] [📱 Generate QR] [📧 Email]     │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ 💳 WITHDRAW EARNINGS                               │
│ [💰 WITHDRAW] [📊 ANALYTICS] [👥 CUSTOMERS]       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### ANALYTICS PAGE:
```
┌─────────────────────────────────────────────────────┐
│ SALES ANALYTICS                            [Export] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📅 [Last 30 Days ▼] [This Month] [This Year]      │
│                                                     │
│ 📊 PERFORMANCE METRICS                             │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Link Clicks: 45                                 │ │
│ │ Signups: 8                                      │ │
│ │ Conversions: 3                                  │ │
│ │ Conversion Rate: 15%                            │ │
│ │ Revenue Generated: RM297                        │ │
│ │ Your Commission: RM120                          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ 📈 SALES TREND                                     │
│ [Chart showing daily/weekly sales]                  │
│                                                     │
│ 👥 CUSTOMER LIST                                   │
│ ┌─────────────────────────────────────────────────┐ │
│ │ John D. - Pro Tier - RM99 (RM40 comm) - Mar 15 │ │
│ │ Sarah L. - Pro Tier - RM99 (RM40 comm) - Mar 12│ │
│ │ Mike K. - Pro Tier - RM99 (RM40 comm) - Mar 10 │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### WITHDRAWAL PAGE:
```
┌─────────────────────────────────────────────────────┐
│ WITHDRAW EARNINGS                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 💰 AVAILABLE BALANCE: RM 245.50                   │
│                                                     │
│ 📋 WITHDRAWAL DETAILS                              │
│ Amount: [RM 200.00        ]                        │
│ Method: [Bank Transfer ▼  ]                        │
│                                                     │
│ 🏦 BANK DETAILS                                    │
│ Bank: [Maybank            ]                        │
│ Account: [1234567890      ]                        │
│ Name: [John Distributor   ]                        │
│                                                     │
│ 💸 FEES                                            │
│ Withdrawal Amount: RM 200.00                       │
│ Platform Fee (5%): RM 10.00                        │
│ You'll Receive: RM 190.00                          │
│                                                     │
│ [💳 REQUEST WITHDRAWAL]                            │
│                                                     │
│ 📜 WITHDRAWAL HISTORY                              │
│ ┌─────────────────────────────────────────────────┐ │
│ │ RM190 - Completed - Mar 1, 2024                │ │
│ │ RM285 - Completed - Feb 15, 2024               │ │
│ │ RM147 - Pending - Mar 18, 2024                 │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🛠 ADMIN DASHBOARD (Your Management Interface)

### ADMIN OVERVIEW:
```
┌─────────────────────────────────────────────────────┐
│ NAMECARD.MY ADMIN DASHBOARD               [Settings]│
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📊 PLATFORM OVERVIEW                              │
│ ┌─────────────┬─────────────┬─────────────────────┐ │
│ │ TOTAL USERS │ DISTRIBUTORS│ MONTHLY REVENUE     │ │
│ │ 2,847       │ 25 active   │ RM 45,600          │ │
│ └─────────────┴─────────────┴─────────────────────┘ │
│                                                     │
│ 💰 PRICING MANAGEMENT                              │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Pro Tier: RM[199] → With Code: RM[99]          │ │
│ │ Commission: RM[40] per sale                     │ │
│ │ Enterprise: RM[599] → With Code: RM[299]       │ │
│ │ Commission: RM[100] per sale                    │ │
│ │ [📝 Update Pricing]                            │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ 🌍 DISTRIBUTOR MANAGEMENT                          │
│ [👥 View All] [➕ Add New] [📊 Performance]       │
│                                                     │
│ 💸 FINANCIAL OVERVIEW                              │
│ [💰 Withdrawals] [📈 Revenue] [🧾 Commissions]    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### DISTRIBUTOR MANAGEMENT:
```
┌─────────────────────────────────────────────────────┐
│ DISTRIBUTOR MANAGEMENT                    [Add New] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🔍 [Search distributors...]                       │
│                                                     │
│ 📋 ACTIVE DISTRIBUTORS (25)                        │
│ ┌─────────────────────────────────────────────────┐ │
│ │ DIST-MY-001 │ John Smith    │ RM1,850 │ [Manage]│ │
│ │ Malaysia    │ 15 sales     │ Active  │ [Suspend]│ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ DIST-SG-002 │ Sarah Tan     │ RM945   │ [Manage]│ │
│ │ Singapore   │ 8 sales      │ Active  │ [Suspend]│ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ DIST-ID-003 │ Ahmad Raja    │ RM2,150 │ [Manage]│ │
│ │ Indonesia   │ 22 sales     │ Active  │ [Suspend]│ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ 🚫 PENDING APPROVAL (3)                            │
│ ┌─────────────────────────────────────────────────┐ │
│ │ DIST-TH-004 │ Somchai Lee   │ Applied │ [Review]│ │
│ │ Thailand    │ Mar 18, 2024  │         │ [Reject]│ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 SYSTEM FEATURES

### DISTRIBUTOR CODE SYSTEM:
- **Unique Codes**: Format: DIST-{COUNTRY}-{NUMBER} (e.g., DIST-MY-001)
- **QR Code Generation**: Automatic QR codes for offline marketing
- **Usage Tracking**: Real-time clicks, signups, conversions
- **Expiration Control**: Optional code expiry dates

### COMMISSION AUTOMATION:
- **Real-time Calculation**: Commission calculated instantly on purchase
- **Balance Updates**: Automatic balance updates for distributors
- **Withdrawal Processing**: Automated approval for verified distributors
- **Tax Documentation**: Generate tax reports for distributors

### FRAUD PREVENTION:
- **Code Validation**: Prevent duplicate/invalid code usage
- **IP Tracking**: Monitor for suspicious activity
- **Refund Handling**: Automatic commission reversal on refunds
- **Distributor Verification**: KYC for high-earning distributors

---

## 📊 DATABASE IMPLICATIONS

### NEW TABLES NEEDED:
1. **distributors** - Distributor profiles and settings
2. **distributor_codes** - Unique codes and tracking
3. **commissions** - Commission records and calculations
4. **withdrawals** - Withdrawal requests and processing
5. **subscription_purchases** - Enhanced purchase tracking with distributor attribution
6. **pricing_tiers** - Dynamic pricing management
7. **regional_settings** - Country-specific pricing and settings

This distributor system transforms NAMECARD.MY from a simple app into a global platform with scalable revenue sharing!