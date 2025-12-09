import { config } from '../config/config';
import { ProcessedEvent, EventCategory } from '../types/events';

export class LinkedInService {
  private accessToken: string;
  private authorUrn: string;

  constructor() {
    if (!config.linkedin.accessToken) {
      throw new Error('LINKEDIN_ACCESS_TOKEN is required but not provided in environment variables');
    }
    if (!config.linkedin.authorUrn) {
      throw new Error('LINKEDIN_AUTHOR_URN is required but not provided in environment variables');
    }
    
    this.accessToken = config.linkedin.accessToken;
    this.authorUrn = config.linkedin.authorUrn;
  }

  async postEvents(events: ProcessedEvent[], cityName: string): Promise<void> {
    if (events.length === 0) {
      // Skip posting when no events found
      return;
    }

    // Sort events by date
    const sortedEvents = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Create post content
    const postContent = this.createPostContent(sortedEvents, cityName);
    
    console.log(`📨 Posting ${sortedEvents.length} events to LinkedIn`);
    console.log(`📏 Post content length: ${postContent.length} characters`);

    // Post to LinkedIn
    await this.createPost(postContent);
  }

  private createPostContent(events: ProcessedEvent[], cityName: string): string {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 14);

    const todayStr = today.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    const endStr = endDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    let content = `🤖 Tech Events ${todayStr} - ${endStr}\n\n`;
    
    // Add events (LinkedIn has a 3000 character limit for posts)
    const maxLength = 2800; // Leave buffer for LinkedIn's limit
    
    for (const event of events) {
      const eventText = this.formatSingleEvent(event);
      
      if (content.length + eventText.length > maxLength) {
        content += '\n... and more events! Check our website for the complete list.';
        break;
      }
      
      content += eventText;
    }
    
    content += '\n#TechEvents #Amsterdam #AI #MachineLearning #TechCommunity #Networking';
    
    return content;
  }

  private formatSingleEvent(event: ProcessedEvent): string {
    const date = new Date(event.date);
    const dateStr = date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    });

    const cleanTitle = this.cleanEventTitle(event.title);
    const categoryEmoji = this.getCategoryEmoji(event.category);
    
    let eventText = `📅 ${dateStr} — ${cleanTitle}\n`;
    eventText += `⏰ ${timeStr} • ${categoryEmoji} ${event.category}\n`;
    eventText += `🔗 ${event.url}\n\n`;
    
    return eventText;
  }

  private async createPost(commentary: string): Promise<void> {
    const postData = {
      author: this.authorUrn,
      commentary: commentary,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false
    };

    try {
      const response = await fetch('https://api.linkedin.com/rest/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202501'
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LinkedIn API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const postId = response.headers.get('x-restli-id');
      console.log('✅ Post created successfully on LinkedIn:', postId);
      
    } catch (error) {
      console.error('❌ Failed to post to LinkedIn:', error);
      throw error;
    }
  }

  private getCategoryEmoji(category: EventCategory): string {
    const categoryEmojis = {
      AI: '🤖',
      Product: '📦',
      Engineering: '⚡',
      Business: '💼',
      UX: '🎨',
      Lifestyle: '🏃',
      Other: '📌'
    };
    return categoryEmojis[category] || '📌';
  }

  private cleanEventTitle(title: string): string {
    // Remove everything inside square brackets (including the brackets)
    return title.replace(/\[[^\]]*\]/g, '').trim();
  }
}