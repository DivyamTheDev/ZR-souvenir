const test = async () => {
    console.log("=== Testing Z&R Finance API ===");
    
    // 1. Login
    const loginRes = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "admin123" })
    });
    const loginData = await loginRes.json();
    console.log("Login Status:", loginRes.status, loginData);
    
    const token = loginData.token;

    // 2. Create Transaction
    const transRes = await fetch("http://localhost:3000/api/transactions", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
            amount: 500,
            type: "INCOME",
            category: "Souvenirs",
            date: new Date().toISOString().slice(0, 10),
            description: "Sold 10 Eiffel keychain batches"
        })
    });
    const transData = await transRes.json();
    console.log("Create Transaction:", transRes.status, transData);

    // 3. Fetch Summary
    const summaryRes = await fetch("http://localhost:3000/api/dashboard/summary", {
        headers: { "Authorization": `Bearer ${token}` }
    });
    const summaryData = await summaryRes.json();
    console.log("Dashboard Summary:", summaryRes.status, summaryData);
};

test().catch(console.error);
