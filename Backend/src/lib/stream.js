import { StreamChat } from 'stream-chat';
import "dotenv/config";

const apiKey = process.env.STEAM_API_KEY;
const apiSecret = process.env.STEAM_API_SECRET;

if (!apiKey || !apiSecret) {
    console.log("Stream Api key or Secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
    try {
        // await streamClient.upsertUser({
        //     id: userData._id.toString(),
        //     name: userData.fullName,
        //     image: userData.profilePic,
        //     role: "user",
        //     customData: {
        //         nativeLanguage: userData.nativeLanguage,
        //         learningLanguage: userData.learningLanguage,
        //         bio: userData.bio
        //     }
        // });

        await streamClient.upsertUsers([userData]);
        return userData;
    } catch (error) {
        console.error("Error in upserting Stream user:", error);
    }
}

export const generateStreamToken = (userId) => {
    try {
        //Ensure userId is a string
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr);
    } catch (error) {
        console.error("Error generating Stream token:", error);
    }
}