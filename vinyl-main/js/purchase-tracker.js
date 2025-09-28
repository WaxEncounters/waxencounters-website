// Purchase Tracking System for Wax Encounters
// This handles real-time updates to inventory and campaign progress

class PurchaseTracker {
    constructor() {
        this.records = this.loadRecords();
    }

    loadRecords() {
        return JSON.parse(localStorage.getItem('uploadedRecords') || '[]');
    }

    saveRecords() {
        localStorage.setItem('uploadedRecords', JSON.stringify(this.records));
    }

    // Process a purchase for immediate sale records
    processImmediatePurchase(recordId, quantity = 1) {
        const record = this.records.find(r => r.id === recordId);
        if (!record || record.type !== 'immediate') {
            console.error('Record not found or not available for immediate sale');
            return false;
        }

        if (record.quantity < quantity) {
            console.error('Insufficient stock');
            return false;
        }

        // Update inventory
        record.quantity -= quantity;
        record.sold = (record.sold || 0) + quantity;

        // Update status if out of stock
        if (record.quantity <= 0) {
            record.status = 'out_of_stock';
        }

        this.saveRecords();
        console.log(`Purchase processed: ${quantity} units of ${record.albumTitle}`);
        
        // Trigger dashboard update
        this.notifyDashboardUpdate();
        
        return true;
    }

    // Process a pre-order for crowdfunding campaigns
    processCrowdfundingPurchase(recordId, amount) {
        const record = this.records.find(r => r.id === recordId);
        if (!record || record.type !== 'crowdfunding') {
            console.error('Record not found or not a crowdfunding campaign');
            return false;
        }

        // Check if campaign is still active
        const daysLeft = this.calculateDaysLeft(record.startDate, record.campaignDays);
        if (daysLeft <= 0) {
            console.error('Campaign has ended');
            return false;
        }

        // Update campaign progress
        record.raised = (record.raised || 0) + amount;
        record.backers = (record.backers || 0) + 1;

        // Check if goal is reached
        if (record.raised >= record.fundingGoal) {
            record.status = 'funded';
            console.log(`Campaign funded: ${record.albumTitle} reached €${record.fundingGoal}`);
        }

        this.saveRecords();
        console.log(`Pre-order processed: €${amount} for ${record.albumTitle}`);
        
        // Trigger dashboard update
        this.notifyDashboardUpdate();
        
        return true;
    }

    // Calculate days left for a campaign
    calculateDaysLeft(startDate, campaignDays) {
        const start = new Date(startDate);
        const end = new Date(start.getTime() + (campaignDays * 24 * 60 * 60 * 1000));
        const now = new Date();
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    // Get record by ID
    getRecord(recordId) {
        return this.records.find(r => r.id === recordId);
    }

    // Get all records
    getAllRecords() {
        return this.records;
    }

    // Get immediate sale records
    getImmediateRecords() {
        return this.records.filter(r => r.type === 'immediate' && r.status === 'available');
    }

    // Get active crowdfunding campaigns
    getActiveCampaigns() {
        return this.records.filter(r => 
            r.type === 'crowdfunding' && 
            r.status === 'campaign' && 
            this.calculateDaysLeft(r.startDate, r.campaignDays) > 0
        );
    }

    // Get funded campaigns
    getFundedCampaigns() {
        return this.records.filter(r => r.type === 'crowdfunding' && r.status === 'funded');
    }

    // Notify dashboard of updates
    notifyDashboardUpdate() {
        // Dispatch custom event for dashboard to listen to
        window.dispatchEvent(new CustomEvent('purchaseUpdate', {
            detail: { records: this.records }
        }));
    }

    // Add new record (called from admin upload)
    addRecord(recordData) {
        const record = {
            id: this.generateRecordId(),
            ...recordData,
            uploadedAt: new Date().toISOString(),
            status: recordData.type === 'immediate' ? 'available' : 'campaign',
            ...(recordData.type === 'immediate' ? {
                sold: 0
            } : {
                raised: 0,
                backers: 0
            })
        };

        this.records.push(record);
        this.saveRecords();
        
        console.log('Record added:', record);
        this.notifyDashboardUpdate();
        
        return record.id;
    }

    generateRecordId() {
        return 'record_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Update record inventory manually (for admin use)
    updateInventory(recordId, newQuantity) {
        const record = this.records.find(r => r.id === recordId);
        if (!record || record.type !== 'immediate') {
            return false;
        }

        record.quantity = newQuantity;
        record.status = newQuantity > 0 ? 'available' : 'out_of_stock';
        
        this.saveRecords();
        this.notifyDashboardUpdate();
        
        return true;
    }

    // Get inventory alerts (low stock)
    getInventoryAlerts() {
        return this.records.filter(r => 
            r.type === 'immediate' && 
            r.quantity > 0 && 
            r.quantity <= 10
        );
    }

    // Get campaign alerts (ending soon)
    getCampaignAlerts() {
        return this.records.filter(r => 
            r.type === 'crowdfunding' && 
            r.status === 'campaign' && 
            this.calculateDaysLeft(r.startDate, r.campaignDays) <= 7
        );
    }

    // Get statistics
    getStatistics() {
        const immediateRecords = this.records.filter(r => r.type === 'immediate');
        const crowdfundingRecords = this.records.filter(r => r.type === 'crowdfunding');
        
        return {
            totalRecords: this.records.length,
            immediateRecords: immediateRecords.length,
            crowdfundingRecords: crowdfundingRecords.length,
            totalRevenue: this.records.reduce((sum, record) => {
                if (record.type === 'immediate') {
                    return sum + (record.price * (record.sold || 0));
                } else if (record.type === 'crowdfunding') {
                    return sum + (record.raised || 0);
                }
                return sum;
            }, 0),
            totalSold: immediateRecords.reduce((sum, record) => sum + (record.sold || 0), 0),
            totalBackers: crowdfundingRecords.reduce((sum, record) => sum + (record.backers || 0), 0)
        };
    }
}

// Global instance
window.PurchaseTracker = new PurchaseTracker();

// Listen for purchase updates on dashboard
window.addEventListener('purchaseUpdate', function(event) {
    console.log('Purchase update received:', event.detail);
    
    // Update dashboard if it's open
    if (typeof loadUsersData === 'function') {
        loadUsersData();
    }
    if (typeof loadCampaignsData === 'function') {
        loadCampaignsData();
    }
    if (typeof updateStatistics === 'function') {
        updateStatistics();
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PurchaseTracker;
}

