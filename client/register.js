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

    // 회원가입 즉시 로그인 처리
    localStorage.setItem("username", data.username);
    localStorage.setItem("token", data.token);

    alert("회원가입 완료");

    location.href = "/";
}
