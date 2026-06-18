async function register() {

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
            "/register",
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

    alert("회원가입 완료");

    location.href =
        "/login";
}