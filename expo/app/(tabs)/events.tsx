import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Calendar, Clock, MapPin, Video } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useEventPosts } from "@/hooks/useWordPress";
import { splitEventsByDate } from "@/services/wordpress";
import { LoadingState, ErrorState, EmptyState } from "@/components/LoadingStates";
import UpcomingEventsContent from "@/components/UpcomingEventsContent";
import type { Post } from "@/services/wordpress";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=800";

const timeFilters = ["Upcoming", "Past"];
const typeFilters = ["All", "Online", "In-Person"];

export default function EventsScreen() {
  const router = useRouter();
  const [activeTimeFilter, setActiveTimeFilter] = useState("Upcoming");
  const [activeTypeFilter, setActiveTypeFilter] = useState("All");

  const {
    data: eventPosts,
    isLoading,
    isError,
    refetch,
  } = useEventPosts(50);

  const { upcoming, past } = useMemo(() => {
    if (!eventPosts) return { upcoming: [], past: [] };
    return splitEventsByDate(eventPosts);
  }, [eventPosts]);

  const baseEvents = activeTimeFilter === "Upcoming" ? upcoming : past;

  const filteredEvents: Post[] = useMemo(() => {
    if (activeTypeFilter === "All") return baseEvents;
    return baseEvents.filter((e) => {
      const text = (e.title + " " + e.excerpt).toLowerCase();
      const isOnline =
        text.includes("online") || text.includes("zoom") || text.includes("live");
      return activeTypeFilter === "Online" ? isOnline : !isOnline;
    });
  }, [baseEvents, activeTypeFilter]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const isEventOnline = (e: Post): boolean => {
    const text = (e.title + " " + e.excerpt).toLowerCase();
    return (
      text.includes("online") || text.includes("zoom") || text.includes("live")
    );
  };

  if (isLoading) {
    return <LoadingState message="Loading events…" />;
  }

  if (isError) {
    return (
      <ErrorState
        message="Unable to load events. Please check your connection."
        onRetry={() => refetch()}
      />
    );
  }

  const showEmpty =
    filteredEvents.length === 0 ||
    (activeTimeFilter === "Upcoming" && upcoming.length === 0);
  const showUpcomingContent =
    activeTimeFilter === "Upcoming" && activeTypeFilter !== "In-Person";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        <Text style={styles.headerSubtitle}>
          Gatherings and sessions from the Foundation
        </Text>
      </View>

      <View style={styles.filterGroup}>
        <View style={styles.timeFilterContainer}>
          {timeFilters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.timeFilter,
                activeTimeFilter === filter && styles.timeFilterActive,
              ]}
              onPress={() => setActiveTimeFilter(filter)}
            >
              <Text
                style={[
                  styles.timeFilterText,
                  activeTimeFilter === filter && styles.timeFilterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.typeFilterContainer}>
          {typeFilters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.typeFilter,
                activeTypeFilter === filter && styles.typeFilterActive,
              ]}
              onPress={() => setActiveTypeFilter(filter)}
            >
              <Text
                style={[
                  styles.typeFilterText,
                  activeTypeFilter === filter && styles.typeFilterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {showEmpty && showUpcomingContent ? (
        <UpcomingEventsContent />
      ) : showEmpty && activeTimeFilter === "Upcoming" ? (
        <View style={styles.emptySection}>
          <Calendar size={48} color={Colors.light.primary} />
          <Text style={styles.emptyTitle}>No upcoming in-person events</Text>
          <Text style={styles.emptyText}>
            New in-person gatherings are announced on the website and through our
            channels. Check back soon for the next gathering.
          </Text>
        </View>
      ) : showEmpty && activeTimeFilter === "Past" ? (
        <View style={styles.emptySection}>
          <Calendar size={48} color={Colors.light.primary} />
          <Text style={styles.emptyTitle}>No past events</Text>
          <Text style={styles.emptyText}>
            Past gatherings will appear here once they are published on the website.
          </Text>
        </View>
      ) : null}

      {filteredEvents.length > 0 && (
        <View style={styles.highlightSection}>
          <TouchableOpacity
            style={styles.highlightCard}
            onPress={() => router.push(`/event/${filteredEvents[0].id}`)}
            activeOpacity={0.95}
          >
            <Image
              source={{ uri: filteredEvents[0].imageUrl ?? FALLBACK_IMAGE }}
              style={styles.highlightImage}
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.9)"]}
              style={styles.highlightGradient}
            />
            <View style={styles.highlightContent}>
              <View style={styles.highlightBadge}>
                {isEventOnline(filteredEvents[0]) ? (
                  <>
                    <Video size={12} color="#fff" />
                    <Text style={styles.highlightBadgeText}>Online</Text>
                  </>
                ) : (
                  <>
                    <MapPin size={12} color="#fff" />
                    <Text style={styles.highlightBadgeText}>In-Person</Text>
                  </>
                )}
              </View>
              <Text style={styles.highlightTitle}>
                {filteredEvents[0].title}
              </Text>
              {filteredEvents[0].excerpt ? (
                <Text style={styles.highlightDescription} numberOfLines={2}>
                  {filteredEvents[0].excerpt}
                </Text>
              ) : null}
              <View style={styles.highlightMeta}>
                <View style={styles.metaItem}>
                  <Calendar size={14} color={Colors.light.primaryLight} />
                  <Text style={styles.highlightMetaText}>
                    {formatDate(filteredEvents[0].date)}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={14} color={Colors.light.primaryLight} />
                  <Text style={styles.highlightMetaText}>
                    {new Date(filteredEvents[0].date).toLocaleTimeString(
                      "en-US",
                      { hour: "numeric", minute: "2-digit" }
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {filteredEvents.length > 0 ? (
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>
            {activeTimeFilter === "Upcoming" ? "Upcoming Events" : "Past Events"}
          </Text>
          <View style={styles.eventsList}>
            {filteredEvents.slice(1).map((event) => {
              const online = isEventOnline(event);
              return (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => router.push(`/event/${event.id}`)}
                  activeOpacity={0.95}
                >
                  <View style={styles.eventDateBox}>
                    <Text style={styles.eventDateDay}>
                      {new Date(event.date).getDate()}
                    </Text>
                    <Text style={styles.eventDateMonth}>
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </Text>
                  </View>
                  <View style={styles.eventContent}>
                    <View style={styles.eventTypeIndicator}>
                      {online ? (
                        <View style={styles.eventTypeBadge}>
                          <Video size={10} color={Colors.light.primary} />
                          <Text style={styles.eventTypeText}>Online</Text>
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.eventTypeBadge,
                            styles.eventTypeBadgeInPerson,
                          ]}
                        >
                          <MapPin size={10} color={Colors.light.secondary} />
                          <Text
                            style={[
                              styles.eventTypeText,
                              styles.eventTypeTextInPerson,
                            ]}
                          >
                            In-Person
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {event.title}
                    </Text>
                    {event.excerpt ? (
                      <Text style={styles.eventDescription} numberOfLines={2}>
                        {event.excerpt}
                      </Text>
                    ) : null}
                    <View style={styles.eventMeta}>
                      <Clock size={12} color={Colors.light.textLight} />
                      <Text style={styles.eventMetaText}>
                        {formatDate(event.date)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={styles.subscribeSection}>
        <LinearGradient
          colors={[Colors.light.secondary, Colors.light.secondaryLight]}
          style={styles.subscribeCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Calendar size={32} color="#fff" />
          <Text style={styles.subscribeTitle}>Stay Connected</Text>
          <Text style={styles.subscribeText}>
            New sessions are announced on our website and social channels
          </Text>
        </LinearGradient>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
  filterGroup: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  timeFilterContainer: {
    flexDirection: "row",
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  timeFilter: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  timeFilterActive: {
    backgroundColor: Colors.light.primary,
  },
  timeFilterText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
  timeFilterTextActive: {
    color: "#fff",
  },
  typeFilterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  typeFilter: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.cardBackground,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  typeFilterActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  typeFilterText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
  typeFilterTextActive: {
    color: "#fff",
  },
  emptySection: {
    marginHorizontal: 20,
    marginBottom: 28,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 22,
    textAlign: "center",
  },
  highlightSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  highlightCard: {
    height: 300,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.light.cardBackground,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  highlightImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  highlightGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
  },
  highlightContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  highlightBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  highlightBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#fff",
  },
  highlightTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 8,
  },
  highlightDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 20,
    marginBottom: 16,
  },
  highlightMeta: {
    flexDirection: "row",
    gap: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  highlightMetaText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500" as const,
  },
  eventsSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  eventsList: {
    paddingHorizontal: 20,
    gap: 14,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  eventDateBox: {
    width: 70,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  eventDateDay: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#fff",
  },
  eventDateMonth: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "rgba(255,255,255,0.85)",
    textTransform: "uppercase",
  },
  eventContent: {
    flex: 1,
    padding: 14,
  },
  eventTypeIndicator: {
    marginBottom: 6,
  },
  eventTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(224, 123, 57, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  eventTypeBadgeInPerson: {
    backgroundColor: "rgba(91, 62, 140, 0.1)",
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.light.primary,
    textTransform: "uppercase",
  },
  eventTypeTextInPerson: {
    color: Colors.light.secondary,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  eventMetaText: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  subscribeSection: {
    paddingHorizontal: 20,
  },
  subscribeCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
  },
  subscribeTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
    marginTop: 12,
    marginBottom: 8,
  },
  subscribeText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },
  bottomPadding: {
    height: 20,
  },
});
