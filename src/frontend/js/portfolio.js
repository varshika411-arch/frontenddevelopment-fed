// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated) {
        window.location.href = 'login.html';
        return;
    }
    
    loadPortfolioData();
});

// Load portfolio data
async function loadPortfolioData() {
    try {
        // Load user data
        const userResponse = await fetchWithAuth('/api/auth/me');
        const userData = await userResponse.json();
        
        if (userResponse.ok) {
            updateProfileInfo(userData.user);
        }

        // Load portfolio data
        const portfolioResponse = await fetchWithAuth(`/api/portfolio/${userData.user.id}`);
        const portfolioData = await portfolioResponse.json();
        
        if (portfolioResponse.ok) {
            displaySkills(portfolioData.portfolio.skills);
            displayVerifiedAchievements(portfolioData.portfolio.achievements);
        }
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        showError('Failed to load portfolio data');
    }
}

// Update profile information
function updateProfileInfo(user) {
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('userGreeting').textContent = `Welcome, ${user.name}!`;
}

// Display skills
function displaySkills(skills) {
    const skillsList = document.getElementById('skillsList');
    skillsList.innerHTML = '';

    if (!skills || skills.length === 0) {
        skillsList.innerHTML = '<p class="text-muted">No skills added yet.</p>';
        return;
    }

    skills.forEach(skill => {
        const skillDiv = document.createElement('div');
        skillDiv.className = 'mb-3';
        skillDiv.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-1">
                <strong>${skill.name}</strong>
                <span class="badge bg-primary">${getSkillLevelText(skill.level)}</span>
            </div>
            <div class="progress" style="height: 8px;">
                <div class="progress-bar" role="progressbar" 
                     style="width: ${(skill.level / 5) * 100}%" 
                     aria-valuenow="${skill.level}" 
                     aria-valuemin="0" 
                     aria-valuemax="5">
                </div>
            </div>
        `;
        skillsList.appendChild(skillDiv);
    });
}

// Display verified achievements
function displayVerifiedAchievements(achievements) {
    const achievementsList = document.getElementById('verifiedAchievementsList');
    achievementsList.innerHTML = '';

    if (!achievements || achievements.length === 0) {
        achievementsList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    No verified achievements yet.
                </div>
            </div>
        `;
        return;
    }

    const verifiedAchievements = achievements.filter(a => a.status === 'verified');
    
    verifiedAchievements.forEach(achievement => {
        const achievementCard = document.createElement('div');
        achievementCard.className = 'col-md-6';
        achievementCard.innerHTML = `
            <div class="card h-100 achievement-card">
                <div class="card-body">
                    <h3 class="card-title h5">${achievement.title}</h3>
                    <p class="card-text">${achievement.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-success">Verified</span>
                        <small class="text-muted">${formatDate(achievement.created_at)}</small>
                    </div>
                </div>
            </div>
        `;
        achievementsList.appendChild(achievementCard);
    });
}

// Submit new skill
async function submitSkill() {
    const skillName = document.getElementById('skillName').value;
    const skillLevel = parseInt(document.getElementById('skillLevel').value);

    if (!skillName || !skillLevel) {
        showError('Please fill in all fields');
        return;
    }

    try {
        const response = await fetchWithAuth('/api/portfolio/skills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                skills: [{
                    name: skillName,
                    level: skillLevel
                }]
            })
        });

        if (response.ok) {
            // Close modal and reload skills
            const modal = bootstrap.Modal.getInstance(document.getElementById('addSkillModal'));
            modal.hide();
            
            // Clear form
            document.getElementById('skillForm').reset();
            
            // Reload portfolio data
            loadPortfolioData();
        } else {
            const data = await response.json();
            showError(data.message || 'Error adding skill');
        }
    } catch (error) {
        console.error('Error submitting skill:', error);
        showError('Error adding skill. Please try again.');
    }
}

// Helper function to convert skill level to text
function getSkillLevelText(level) {
    const levels = {
        1: 'Beginner',
        2: 'Intermediate',
        3: 'Advanced',
        4: 'Expert',
        5: 'Master'
    };
    return levels[level] || 'Unknown';
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.role = 'alert';
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const mainContent = document.querySelector('main');
    mainContent.insertBefore(errorDiv, mainContent.firstChild);
}