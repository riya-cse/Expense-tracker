
const transactionForm = document.getElementById("transactionForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");
const transactionCountElement = document.getElementById("transactionCount");
const transactionList = document.getElementById("transactionList");

const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");

const categorySummary = document.getElementById("categorySummary");
const monthlySummary = document.getElementById("monthlySummary");

const incomePercent = document.getElementById("incomePercent");
const expensePercent = document.getElementById("expensePercent");

const incomeBar = document.getElementById("incomeBar");
const expenseBar = document.getElementById("expenseBar");

const cancelEditBtn = document.getElementById("cancelEditBtn");

let transactions = [];
let editId = null;

let incomeExpenseChart = null;
let categoryExpenseChart = null;
let monthlyExpenseChart = null;

const STORAGE_KEY = "expenseTrackerTransactions";

function formatCurrency(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN");
}

function generateId() {
    return Date.now().toString() + Math.random().toString(36).slice(2);
}

function setDefaultDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    dateInput.value = `${year}-${month}-${day}`;
}

function saveTransactions() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(transactions)
    );
}

function loadTransactions() {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
        try {
            transactions = JSON.parse(savedData);

            if (!Array.isArray(transactions)) {
                transactions = [];
            }
        } catch (error) {
            console.error(error);
            transactions = [];
        }
    } else {
        transactions = [
            {
                id: generateId(),
                description: "Salary",
                amount: 10000,
                type: "income",
                category: "Other",
                date: "2026-10-01"
            },
            {
                id: generateId(),
                description: "Food",
                amount: 500,
                type: "expense",
                category: "Food",
                date: "2026-10-01"
            },
            {
                id: generateId(),
                description: "Travel",
                amount: 300,
                type: "expense",
                category: "Travel",
                date: "2026-10-02"
            },
            {
                id: generateId(),
                description: "Shopping",
                amount: 700,
                type: "expense",
                category: "Shopping",
                date: "2026-10-02"
            }
        ];

        saveTransactions();
    }
}

function updateDashboard() {
    let income = 0;
    let expense = 0;

    transactions.forEach(transaction => {
        const amount = Number(transaction.amount);

        if (transaction.type === "income") {
            income += amount;
        } else {
            expense += amount;
        }
    });

    const balance = income - expense;

    balanceElement.textContent = formatCurrency(balance);
    incomeElement.textContent = formatCurrency(income);
    expenseElement.textContent = formatCurrency(expense);
    transactionCountElement.textContent = transactions.length;

    updateComparison(income, expense);
    updateIncomeExpenseChart(income, expense);
}

function updateComparison(income, expense) {
    const total = income + expense;

    let incomePercentage = 0;
    let expensePercentage = 0;

    if (total > 0) {
        incomePercentage = (income / total) * 100;
        expensePercentage = (expense / total) * 100;
    }

    incomePercent.textContent =
        incomePercentage.toFixed(1) + "%";

    expensePercent.textContent =
        expensePercentage.toFixed(1) + "%";

    incomeBar.style.width =
        incomePercentage + "%";

    expenseBar.style.width =
        expensePercentage + "%";
}

function updateIncomeExpenseChart(income, expense) {
    const canvas =
        document.getElementById("incomeExpenseChart");

    if (!canvas) {
        return;
    }

    if (typeof Chart === "undefined") {
        console.error("Chart.js is not loaded.");
        return;
    }

    if (incomeExpenseChart) {
        incomeExpenseChart.destroy();
    }

    incomeExpenseChart = new Chart(canvas, {
        type: "doughnut",

        data: {
            labels: ["Income", "Expense"],

            datasets: [{
                data: [income, expense],

                backgroundColor: [
                    "#16a34a",
                    "#dc2626"
                ],

                borderWidth: 0
            }]
        },

        options: {
            responsive: true,

            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

transactionForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const description =
        descriptionInput.value.trim();

    const amount =
        Number(amountInput.value);

    const type =
        typeInput.value;

    const category =
        categoryInput.value;

    const date =
        dateInput.value;

    if (!description) {
        alert("Please enter description.");
        return;
    }

    if (!amount || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    if (!date) {
        alert("Please select a date.");
        return;
    }

    if (editId !== null) {
        const index =
            transactions.findIndex(
                transaction => transaction.id === editId
            );

        if (index !== -1) {
            transactions[index] = {
                ...transactions[index],
                description,
                amount,
                type,
                category,
                date
            };
        }

        editId = null;

        transactionForm.querySelector(
            'button[type="submit"]'
        ).textContent = "Add Transaction";

        cancelEditBtn.style.display = "none";

    } else {
        transactions.push({
            id: generateId(),
            description,
            amount,
            type,
            category,
            date
        });
    }

    saveTransactions();

    transactionForm.reset();

    setDefaultDate();

    renderAll();
});

function editTransaction(id) {
    const transaction =
        transactions.find(
            item => item.id === id
        );

    if (!transaction) {
        return;
    }

    descriptionInput.value =
        transaction.description;

    amountInput.value =
        transaction.amount;

    typeInput.value =
        transaction.type;

    categoryInput.value =
        transaction.category;

    dateInput.value =
        transaction.date;

    editId = id;

    transactionForm.querySelector(
        'button[type="submit"]'
    ).textContent = "Update Transaction";

    cancelEditBtn.style.display = "block";
}

cancelEditBtn.addEventListener("click", function() {
    editId = null;

    transactionForm.reset();

    setDefaultDate();

    transactionForm.querySelector(
        'button[type="submit"]'
    ).textContent = "Add Transaction";

    cancelEditBtn.style.display = "none";
});

function deleteTransaction(id) {
    const transaction =
        transactions.find(
            item => item.id === id
        );

    if (!transaction) {
        return;
    }

    const confirmDelete =
        confirm(
            `Delete "${transaction.description}"?`
        );

    if (!confirmDelete) {
        return;
    }

    transactions =
        transactions.filter(
            item => item.id !== id
        );

    saveTransactions();

    renderAll();
}

function renderTransactions() {
    transactionList.innerHTML = "";

    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedFilter =
        filterType.value;

    let filteredTransactions =
        transactions.filter(transaction => {

            const description =
                String(
                    transaction.description
                ).toLowerCase();

            const category =
                String(
                    transaction.category
                ).toLowerCase();

            const matchesSearch =
                description.includes(searchText) ||
                category.includes(searchText);

            const matchesFilter =
                selectedFilter === "all" ||
                transaction.type === selectedFilter;

            return matchesSearch && matchesFilter;
        });

    filteredTransactions.sort(
        (a, b) =>
            new Date(b.date) - new Date(a.date)
    );

    if (filteredTransactions.length === 0) {
        transactionList.innerHTML = `
            <p style="text-align:center; color:#777; padding:20px;">
                No transactions found.
            </p>
        `;

        return;
    }

    filteredTransactions.forEach(transaction => {
        const div =
            document.createElement("div");

        div.classList.add(transaction.type);

        const sign =
            transaction.type === "income"
                ? "+"
                : "-";

        const color =
            transaction.type === "income"
                ? "#16a34a"
                : "#dc2626";

        div.innerHTML = `
            <h3>
                ${escapeHTML(transaction.description)}
            </h3>

            <p>
                <strong>Amount:</strong>
                <span style="color:${color}; font-weight:bold;">
                    ${sign}${formatCurrency(transaction.amount)}
                </span>
            </p>

            <p>
                <strong>Type:</strong>
                ${capitalize(transaction.type)}
            </p>

            <p>
                <strong>Category:</strong>
                ${escapeHTML(transaction.category)}
            </p>

            <p>
                <strong>Date:</strong>
                ${formatDate(transaction.date)}
            </p>

            <button
                class="edit-btn"
                onclick="editTransaction('${transaction.id}')"
            >
                Edit
            </button>

            <button
                class="delete-btn"
                onclick="deleteTransaction('${transaction.id}')"
            >
                Delete
            </button>
        `;

        transactionList.appendChild(div);
    });
}

function renderCategorySummary() {
    const categoryTotals = {};

    transactions.forEach(transaction => {
        if (transaction.type !== "expense") {
            return;
        }

        const category =
            transaction.category;

        if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
        }

        categoryTotals[category] +=
            Number(transaction.amount);
    });

    categorySummary.innerHTML = "";

    const categories =
        Object.entries(categoryTotals);

    if (categories.length === 0) {
        categorySummary.innerHTML =
            `<p style="color:#777;">No expenses available.</p>`;

        return;
    }

    const maxAmount =
        Math.max(
            ...categories.map(
                item => item[1]
            )
        );

    categories.sort(
        (a, b) => b[1] - a[1]
    );

    categories.forEach(
        ([category, amount]) => {

            const percentage =
                maxAmount > 0
                    ? (amount / maxAmount) * 100
                    : 0;

            const div =
                document.createElement("div");

            div.className =
                "category-item";

            div.innerHTML = `
                <div class="category-header">
                    <span>
                        ${escapeHTML(category)}
                    </span>

                    <span>
                        ${formatCurrency(amount)}
                    </span>
                </div>

                <div class="progress-bar">
                    <div
                        class="progress-fill"
                        style="width:${percentage}%"
                    ></div>
                </div>
            `;

            categorySummary.appendChild(div);
        }
    );
}

function updateCategoryExpenseChart() {
    const canvas =
        document.getElementById(
            "categoryExpenseChart"
        );

    if (!canvas) {
        return;
    }

    if (typeof Chart === "undefined") {
        console.error("Chart.js is not loaded.");
        return;
    }

    const categoryTotals = {};

    transactions.forEach(transaction => {
        if (transaction.type !== "expense") {
            return;
        }

        const category =
            transaction.category;

        if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
        }

        categoryTotals[category] +=
            Number(transaction.amount);
    });

    const labels =
        Object.keys(categoryTotals);

    const data =
        Object.values(categoryTotals);

    if (categoryExpenseChart) {
        categoryExpenseChart.destroy();
    }

    if (labels.length === 0) {
        return;
    }

    categoryExpenseChart =
        new Chart(canvas, {
            type: "doughnut",

            data: {
                labels: labels,

                datasets: [{
                    data: data,

                    backgroundColor: [
                        "#2563eb",
                        "#16a34a",
                        "#dc2626",
                        "#f59e0b",
                        "#9333ea",
                        "#0891b2",
                        "#ea580c",
                        "#64748b"
                    ],

                    borderWidth: 0
                }]
            },

            options: {
                responsive: true,

                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        });
}

function renderMonthlySummary() {
    const monthlyTotals = {};

    transactions.forEach(transaction => {
        if (transaction.type !== "expense") {
            return;
        }

        const date =
            new Date(transaction.date);

        if (isNaN(date)) {
            return;
        }

        const monthKey =
            `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;

        if (!monthlyTotals[monthKey]) {
            monthlyTotals[monthKey] = 0;
        }

        monthlyTotals[monthKey] +=
            Number(transaction.amount);
    });

    monthlySummary.innerHTML = "";

    const months =
        Object.entries(monthlyTotals)
            .sort(
                (a, b) =>
                    b[0].localeCompare(a[0])
            );

    if (months.length === 0) {
        monthlySummary.innerHTML =
            `<p style="color:#777;">No monthly expense data available.</p>`;

        return;
    }

    months.forEach(
        ([monthKey, amount]) => {

            const [year, month] =
                monthKey.split("-");

            const monthName =
                new Date(
                    Number(year),
                    Number(month) - 1,
                    1
                ).toLocaleString(
                    "en-IN",
                    {
                        month: "long"
                    }
                );

            const div =
                document.createElement("div");

            div.style.marginBottom = "10px";

            div.innerHTML = `
                <strong>
                    ${monthName} ${year}
                </strong>
                :
                ${formatCurrency(amount)}
            `;

            monthlySummary.appendChild(div);
        }
    );
}

function updateMonthlyExpenseChart() {
    const canvas =
        document.getElementById(
            "monthlyExpenseChart"
        );

    if (!canvas) {
        return;
    }

    if (typeof Chart === "undefined") {
        console.error("Chart.js is not loaded.");
        return;
    }

    const monthlyTotals = {};

    transactions.forEach(transaction => {
        if (transaction.type !== "expense") {
            return;
        }

        const date =
            new Date(transaction.date);

        if (isNaN(date)) {
            return;
        }

        const monthKey =
            `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;

        if (!monthlyTotals[monthKey]) {
            monthlyTotals[monthKey] = 0;
        }

        monthlyTotals[monthKey] +=
            Number(transaction.amount);
    });

    const months =
        Object.keys(monthlyTotals).sort();

    const labels =
        months.map(monthKey => {

            const [year, month] =
                monthKey.split("-");

            return new Date(
                Number(year),
                Number(month) - 1,
                1
            ).toLocaleString(
                "en-IN",
                {
                    month: "short",
                    year: "numeric"
                }
            );
        });

    const data =
        months.map(
            month => monthlyTotals[month]
        );

    if (monthlyExpenseChart) {
        monthlyExpenseChart.destroy();
    }

    if (labels.length === 0) {
        return;
    }

    monthlyExpenseChart =
        new Chart(canvas, {
            type: "bar",

            data: {
                labels: labels,

                datasets: [{
                    label: "Monthly Expense",

                    data: data,

                    backgroundColor: "#2563eb",

                    borderRadius: 6
                }]
            },

            options: {
                responsive: true,

                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
}

searchInput.addEventListener(
    "input",
    renderTransactions
);

filterType.addEventListener(
    "change",
    renderTransactions
);

function formatDate(dateString) {
    if (!dateString) {
        return "";
    }

    const parts =
        dateString.split("-");

    if (parts.length !== 3) {
        return dateString;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function capitalize(text) {
    if (!text) {
        return "";
    }

    return text.charAt(0).toUpperCase() +
        text.slice(1);
}

function escapeHTML(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderAll() {
    updateDashboard();

    renderTransactions();

    renderCategorySummary();

    updateCategoryExpenseChart();

    renderMonthlySummary();

    updateMonthlyExpenseChart();
}

loadTransactions();

setDefaultDate();

cancelEditBtn.style.display = "none";

renderAll();
