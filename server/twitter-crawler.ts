import { TwitterApi } from "twitter-api-v2";
import { storage } from "./storage";
import { summarizeJobPost } from "./grok";

if (!process.env.TWITTER_BEARER_TOKEN) {
  throw new Error("TWITTER_BEARER_TOKEN environment variable must be set");
}

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

export async function crawlTwitterJobs() {
  try {
    // Search for job-related tweets
    const tweets = await twitterClient.v2.search(
      '(hiring OR "job opening" OR "we\'re looking") -is:retweet lang:en'
    );

    for await (const tweet of tweets) {
      // Check if we've already processed this tweet
      const existingJob = await storage.getTwitterJobByTweetId(tweet.id);
      if (existingJob) continue;

      // Store the raw tweet
      const twitterJob = await storage.createTwitterJob({
        tweetId: tweet.id,
        content: tweet.text,
        author: tweet.author_id,
      });

      // Use AI to parse job details
      const parsedJob = await summarizeJobPost(tweet.text);
      
      if (parsedJob.confidence > 0.7) {
        // Create a proper job listing
        const job = await storage.createJob({
          title: parsedJob.title,
          company: parsedJob.company,
          location: parsedJob.location,
          description: tweet.text,
          requirements: parsedJob.requirements,
          type: parsedJob.type,
          source: "twitter",
          sourceUrl: `https://twitter.com/i/web/status/${tweet.id}`,
        });

        // Update the twitter job with parsed information
        await storage.updateTwitterJob(twitterJob.id, {
          parsedTitle: parsedJob.title,
          parsedCompany: parsedJob.company,
          parsedLocation: parsedJob.location,
          processed: true,
          jobId: job.id,
        });
      }
    }
  } catch (error) {
    console.error("Error crawling Twitter jobs:", error);
  }
}

// Run the crawler every hour
setInterval(crawlTwitterJobs, 60 * 60 * 1000);
