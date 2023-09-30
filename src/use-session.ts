import { RealtimeChannel, Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supaClient } from "./supa-client";
import { useNavigate } from "react-router-dom";
import { setReturnPath } from "./Login";

export interface UserProfile {
  username: string;
  avatarUrl?: string;
}

export interface SupabaseUserInfo {
  session: Session | null;
  profile: UserProfile | null;
}

export function useSession(): SupabaseUserInfo {
  const [userInfo, setUserInfo] = useState<SupabaseUserInfo>({
    profile: null,
    session: null,
  });

  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    supaClient.auth.getSession().then(({ data: { session } }) => {
      setUserInfo({ ...userInfo, session });
      supaClient.auth.onAuthStateChange((_event, session) => {
        setUserInfo({ session, profile: null });
      });
    });
  }, []);

  useEffect(() => {
    if (userInfo.session?.user && !userInfo.profile) {
      listenToUserProfileChanges(userInfo.session.user.id).then(
        (newChannel) => {
          if (channel) {
            channel.unsubscribe();
          }
          setChannel(newChannel);
        }
      );
    } else if (!userInfo.session?.user) {
      channel?.unsubscribe();
      setChannel(null);
    }
  }, [userInfo.session]);

  async function listenToUserProfileChanges(userId: string) {
    const { data } = await supaClient
      .from("user_profiles")
      .select("*")
      .filter("user_id", "eq", userId);
    
    if (data?.[0]) {
      setUserInfo({ ...userInfo, profile: data?.[0] });
    } else {
      setReturnPath();
      navigate("/welcome");
    }
    
    return supaClient
      .channel(`public:user_profiles`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_profiles",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setUserInfo({ ...userInfo, profile: payload.new as UserProfile });
        }
      )
      .subscribe();
  }

  return userInfo;
}