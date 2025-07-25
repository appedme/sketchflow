import { TweetGrid } from "@/components/ui/tweet-grid";

const exampleTweets = [
    "1947960911832162360", // @sarvagya_kul
    "1947957536659054848", // @SH20RAJ
    "1948577885109018977", // Example tweet
];

function TweetGridDemo() {
    return <TweetGrid tweets={exampleTweets} columns={2} spacing="md" />;
}

export { TweetGridDemo };