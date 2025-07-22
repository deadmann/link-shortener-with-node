const form = document.getElementById('shortenForm');
const result = document.getElementById('result');
const linksList = document.getElementById('linksList');

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
        originalUrl: formData.get('originalUrl'),
        customCode: formData.get('customCode') || undefined
    };

    try {
        const response = await fetch('/api/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();

        if (response.ok) {
            result.className = 'result';
            result.innerHTML = `
                <strong>Short URL created successfully!</strong><br>
                <div class="short-url">${responseData.shortUrl}</div>
                <div style="margin-top: 10px;">
                    <a href="${responseData.shortUrl}" target="_blank">Test Link</a>
                </div>
            `;
            form.reset();
            loadLinks(); // Refresh the links list
        } else {
            result.className = 'result error';
            result.innerHTML = `<strong>Error:</strong> ${responseData.error}`;
        }

        result.style.display = 'block';
    } catch (error) {
        result.className = 'result error';
        result.innerHTML = `<strong>Error:</strong> Failed to create short link`;
        result.style.display = 'block';
    }
});

// Load and display recent links
async function loadLinks() {
    try {
        const response = await fetch('/api/links');
        const links = await response.json();

        if (links.length === 0) {
            linksList.innerHTML = '<p>No links created yet.</p>';
            return;
        }

        linksList.innerHTML = links.map(link => `
            <div class="link-item">
                <div class="short-url">
                    <a href="/${link.shortCode}" target="_blank">
                        ${window.location.origin}/${link.shortCode}
                    </a>
                </div>
                <div class="link-original">→ ${link.originalUrl}</div>
                <div class="link-stats">
                    Clicks: ${link.clicks} | Created: ${new Date(link.createdAt).toLocaleDateString()}
                </div>
            </div>
        `).join('');
    } catch (error) {
        linksList.innerHTML = '<p>Error loading links.</p>';
    }
}

// Load links when page loads
document.addEventListener('DOMContentLoaded', loadLinks);