import matplotlib.pyplot as plt

# Data
features = [
    "Bed-Level Booking", "Real-Time Chat", "Privacy Protection",
    "Search Filters", "Reviews & Ratings", "Map Integration",
    "Owner/User Dashboards", "Unbooking Control",
    "Booking Transparency", "24/7 Online Access"
]

traditional = [2, 3, 2, 3, 4, 3, 1, 2, 3, 4]
new_system = [10, 9, 10, 9, 9, 10, 9, 10, 10, 10]

x = range(len(features))

# Plotting
plt.figure(figsize=(12, 6))
plt.barh(x, traditional, height=0.4, label='Traditional System', color='gray')
plt.barh([i + 0.4 for i in x], new_system, height=0.4, label='Proposed Web Platform', color='green')

plt.yticks([i + 0.2 for i in x], features)
plt.xlabel("Feature Score (out of 10)")
plt.title("Comparison: Traditional Hostel Booking vs Proposed Web Platform")
plt.legend()
plt.tight_layout()

# Save chart
plt_path = "/mnt/data/traditional_vs_proposed_comparison_chart.png"
plt.savefig(plt_path)
plt_path
