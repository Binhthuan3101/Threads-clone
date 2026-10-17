import { useEffect, useRef } from "react";

export function useInfiniteScroll(callback, hasMore, loading) {
  const observerRef = useRef(null);

  useEffect(() => {
    if (loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) callback();
      },
      { threshold: 0.1, rootMargin: "120px" }
    );

    const el = observerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [callback, hasMore, loading]);

  return observerRef;
}