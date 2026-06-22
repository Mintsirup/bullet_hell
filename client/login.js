async function login() {

    const username =
        document
        .getElementById("username")
        .value;

    const password =
        document
        .getElementById("password")
        .value;

    const response =
        await fetch(
            "/login",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        username,
                        password
                    })
            }
        );

    const data =
        await response.json();

    if (!data.success) {

        alert(data.error);

        return;
    }

    localStorage.setItem("username", data.username);
    localStorage.setItem("token", data.token);

    location.href = "/";
}
