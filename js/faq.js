const faqData = [
	{
		title: "What is this website?",
		ans: "Tiktok Follower Analyzer is a user-friendly website that helps you identify which of your followers are not following you back. If you notice a decrease in followers, they will appear if you followed them. A tool to check all of your followers that unfollowed you is also available. This website works on mobile devices and on desktop browsers."
	},
	{
		title: "How does it work?",
		ans: "Using a script that cross-references the accounts you follow with those that follow you, you can create a list of accounts that do not follow you back. Additionally, by comparing your followers over two data files, you can create a list of accounts who have unfollowed you."
	},
	{
		title: "How do I find my unfollowers?",
		ans: "If your friends list is not the same number as your following list, there are accounts you follow that do not follow you back. You will need to have your data ready before using this tool. You can request your data using the instructions above. You need to request your data once to check friend unfollows, and twice for all unfollows."
	},
	{
		title: "How can I find all the people who unfollowed me instead of just those in my friends list?",
		ans: "In order to find anyone that unfollowed you, even if you never followed them back, you would need to request your data twice: once BEFORE you notice someone has unfollowed, and once AFTER you notice. Do not trust downloadable apps that require you to log in, as any malicious attack on that app can put your data at risk!"
	},
	{
		title: "Do you keep or collect my data after it is uploaded?",
		ans: "No. No personal data involving TikTok, your account, or anyone's account is stored during the entire process. Your IP address is logged only to limit excess use. Most Internet Service Providers (ISPs) such as T-Mobile and AT&T provide you with a dynamic IP address, meaning that the address is not permanent, changes periodically, and cannot easily be traced back to you."
	},
	{
		title: "How many times can I use this tool?",
		ans: "You are limited to 5 requests per 24-hours. This is to provide leniency in case you did not finish analyzing any unfollowers, and to prevent overloading the server."
	},
	{
		title: "Does this work for Instagram too?",
		ans: "No. Tools already exist to find instagram unfollowers, but none have yet to become publically available for TikTok."
	},
	{
		title: "My friends list does not match my following list. I know I have an unfollower. Why does the site say I have 0 unfollowers?",
		ans: "Unfortunately, data is not perfect. As large as TikTok and many social media platforms are, there are going to be mistakes, bugs, and errors in the way code is processed and handled. Many of your followers/following will show up as N/A (Not applicable), meaning that those accounts were banned, disabled, or their data was improperly processed. Many of your followers/following will also show up more than once, meaning that you or others quickly followed, unfollowed, and followed back. These mistakes are not permanent, and social media platforms perform a few checks per year to make sure these mistakes get fixed. If you notice a significant drop in followers or likes, it is most likely that the data was cleaned. Simply put: there is nothing you or this tool can do but wait for the data to get fixed."
	},	
	{
		title: "How often should I check for unfollowers?",
		ans: "It depends on your preferences and the actions you choose to do after discovering who unfollowed. I would not recommend requesting data every day, or every time someone unfollows. Wait a few days or up to a week to request again."
	},	
	{
		title: "Can I check multiple accounts using this tool?",
		ans: "Yes. Each request must be made individually, and each .zip or .json file must be uploaded and analyzed individually. When comparing followers over time, both files must be from the same account. After each analysis, the Analyze button will become unavailable until a new file is uploaded."
	},	
	{
		title: "The website says my file size is too big. What happened?",
		ans: "Although we only require your followers and followings list, the script needs to parse all of your Profile and posts data. This includes every post your account has made. Post data is larger than followers data, and takes up most of the memory in the average user's data. To prevent excess data use, file sizes are limited for both .zip and .json formats. If you know how to extract .zip files, and if you know how to edit .json files, you can manually remove the 'Post' section, then upload the .json file."
	},	
	{
		title: "I encountered an error in your site. How can I contact you about this?",
		ans: "Issues can be posted on my GitHub repo's <a class=\"faq-link\" href=\"https://github.com/eiguzman/tiktok-unfollow/issues\" target=\"_blank\" rel=\"noopener noreferrer\">Issues page</a> (GitHub account required to post)."
	},	
	{
		title: "Is there any way I can support you for your work?",
		ans: "Every little bit helps! Follow <a class=\"faq-link\" href=\"https://www.tiktok.com/@jessmorales__\" target=\"_blank\" rel=\"noopener noreferrer\">@jessmorales__</a> if you like this site or the pink aesthetic. Share this site with your friends and followers if they need this tool. Data and website management is expensive; please consider supporting me financially via <a class=\"faq-link\" href=\"https://www.paypal.com/paypalme/eiguzman\" target=\"_blank\" rel=\"noopener noreferrer\">my PayPal link</a> (even $1 or less goes a long way!)"
	}
]

let currentFAQIndex = 0;

const faqTitleEl = document.getElementById('faqTitle');
const faqAnswerEl = document.getElementById('faqAnswer');
const faqPrevBtn = document.getElementById('faqPrevBtn');
const faqNextBtn = document.getElementById('faqNextBtn');

// Function to display FAQ at current index
function showFAQ(index) {
	const faq = faqData[index];
	faqTitleEl.innerHTML = faq.title;
	faqAnswerEl.innerHTML = faq.ans;
}

// Initialize first FAQ
showFAQ(currentFAQIndex);

// Button navigation
faqPrevBtn.addEventListener('click', () => {
	currentFAQIndex = (currentFAQIndex - 1 + faqData.length) % faqData.length;
	showFAQ(currentFAQIndex);
});

faqNextBtn.addEventListener('click', () => {
	currentFAQIndex = (currentFAQIndex + 1) % faqData.length;
	showFAQ(currentFAQIndex);
});

// Swipe gestures
const faqContainer = document.querySelector('.faq-container');

let startX_faq = 0;
let isDragging_faq = false;

faqContainer.addEventListener('touchstart', (e) => {
	if (e.touches.length === 1) {
		startX_faq = e.touches[0].clientX;
		isDragging_faq = true;
	}
});

faqContainer.addEventListener('touchmove', (e) => {
	if (!isDragging_faq) return;
	const touchX = e.touches[0].clientX;
	const deltaX = touchX - startX_faq;
});

faqContainer.addEventListener('touchend', (e) => {
	if (!isDragging_faq) return;
	isDragging_faq = false;
	const endX = e.changedTouches[0].clientX;
	const deltaX = endX - startX_faq;
	const threshold = 50; // swipe sensitivity
	if (deltaX > threshold) {
		// Swipe right -> previous FAQ
		currentFAQIndex = (currentFAQIndex - 1 + faqData.length) % faqData.length;
	} else if (deltaX < -threshold) {
		// Swipe left -> next FAQ
		currentFAQIndex = (currentFAQIndex + 1) % faqData.length;
	}
	showFAQ(currentFAQIndex);
});