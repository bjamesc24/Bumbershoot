import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { isFavorited, toggleFavorite } from "../storage/favoritesStore";
import { useAttending } from "../context/AttendingContext";

export function useItemActions(id: string, item: any) {
  const [favorited, setFavorited] = useState(false);
  const { isAttending, toggle } = useAttending();

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      isFavorited(id).then(setFavorited);
    }, [id])
  );

  const handleFavorite = async (title: string) => {
    const { isNowFavorited } = await toggleFavorite({
      id,
      title,
      start: item?.meta?.event_start_time,
    });
    setFavorited(isNowFavorited);
  };

  const handleAttending = async (title: string) => {
    await toggle({
      id,
      title,
      start: item?.meta?.event_start_time,
      end: item?.meta?.event_end_time,
      stage: item?.meta?.stage ?? item?.meta?.district ?? item?.name,
    });
  };

  return {
    favorited,
    attending: isAttending(id),
    handleFavorite,
    handleAttending,
  };
}