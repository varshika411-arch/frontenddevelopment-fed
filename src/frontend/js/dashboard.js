// Check if user is authenticated
document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated) {
        window.location.href = 'login.html';
        return;
    }
    
    loadUserData();
    loadAchievements();
});

// Load user data
async function loadUserData() {
    try {
        const response = await fetchWithAuth('/api/auth/me');
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('userName').textContent = data.user.name;
            document.getElementById('userEmail').textContent = data.user.email;
            document.getElementById('userGreeting').textContent = `Welcome, ${data.user.name}!`;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Load achievements
async function loadAchievements() {
    try {
        const response = await fetchWithAuth('/api/achievements');
        const data = await response.json();
        
        if (response.ok) {
            updateAchievementStats(data.achievements);
            displayAchievements(data.achievements);
        }
    } catch (error) {
        console.error('Error loading achievements:', error);
    }
}

// Update achievement statistics
function updateAchievementStats(achievements) {
    const total = achievements.length;
    const verified = achievements.filter(a => a.status === 'verified').length;
    const pending = total - verified;

    document.getElementById('totalAchievements').textContent = total;
    document.getElementById('verifiedAchievements').textContent = verified;
    document.getElementById('pendingAchievements').textContent = pending;
}

// Display achievements in the list
function displayAchievements(achievements) {
    const container = document.getElementById('achievementsList');
    container.innerHTML = '';

    if (achievements.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    You haven't added any achievements yet. Click the "Add Achievement" button to get started!
                </div>
            </div>
        `;
        return;
    }

    achievements.forEach(achievement => {
        const card = document.createElement('div');
        card.className = 'col-md-6';
        card.innerHTML = `
            <div class="card achievement-card h-100">
                <div class="card-body">
                    <h3 class="card-title h5">${achievement.title}</h3>
                    <p class="card-text">${achievement.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-${achievement.status === 'verified' ? 'success' : 'warning'}">
                            ${achievement.status.charAt(0).toUpperCase() + achievement.status.slice(1)}
                        </span>
                        <small class="text-muted">${formatDate(achievement.created_at)}</small>
                    </div>
                </div>
                <div class="card-footer bg-transparent">
                    <div class="btn-group w-100">
                        <button class="btn btn-outline-primary btn-sm" onclick="editAchievement(${achievement.id})">
                            Edit
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteAchievement(${achievement.id})">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Submit new achievement
async function submitAchievement() {
    const title = document.getElementById('achievementTitle').value;
    const category = document.getElementById('achievementCategory').value;
    const description = document.getElementById('achievementDescription').value;

    if (!title || !category || !description) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetchWithAuth('/api/achievements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                category,
                description
            })
        });

        if (response.ok) {
            // Close modal and reload achievements
            const modal = bootstrap.Modal.getInstance(document.getElementById('addAchievementModal'));
            modal.hide();
            
            // Clear form
            document.getElementById('achievementForm').reset();
            
            // Reload achievements
            loadAchievements();
        } else {
            const data = await response.json();
            alert(data.message || 'Error adding achievement');
        }
    } catch (error) {
        console.error('Error submitting achievement:', error);
        alert('Error submitting achievement. Please try again.');
    }
}

// Delete achievement
async function deleteAchievement(id) {
    if (!confirm('Are you sure you want to delete this achievement?')) {
        return;
    }

    try {
        const response = await fetchWithAuth(`/api/achievements/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadAchievements();
        } else {
            const data = await response.json();
            alert(data.message || 'Error deleting achievement');
        }
    } catch (error) {
        console.error('Error deleting achievement:', error);
        alert('Error deleting achievement. Please try again.');
    }
}

// Edit achievement
async function editAchievement(id) {
    // TODO: Implement achievement editing functionality
    alert('Edit functionality coming soon!');
}