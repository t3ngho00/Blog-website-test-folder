document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('user_name').value; // changed this line
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;

    fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_name: username, password: password, email: email }), // changed this line
    })
    .then(response => response.json())
    .then(data => {
        if (data.user_id) {
            alert('User created successfully');
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});