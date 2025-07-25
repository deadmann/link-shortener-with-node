document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('initForm');
    const errorMsg = document.getElementById('errorMsg')

    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        errorMsg.classList.add('hidden')

        const email = form.email.value.trim()
        const password = form.password.value
        const confirmPassword = form.confirmPassword.value
        const mode = form.mode.value

        const payload = {email, password, confirmPassword, mode}

        try {
            const res = await fetch('/init', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            const result = res.json()

            if (!res.ok) {
                errorMsg.textContent = result.erorr || 'Something went wrong'
                errorMsg.classList.remove('hidden')
                return
            }

            window.location.href = '/'
        } catch (err) {
            console.log(err)
            errorMsg.textContent = 'Request failed. Try again.'
            errorMsg.classList.remove('hidden')
        }
    })
})