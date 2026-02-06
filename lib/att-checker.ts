import { chromium, Browser, Page } from 'playwright-core';

export interface AvailabilityResult {
  status: 'FIBER_AVAILABLE' | 'INTERNET_AIR_AVAILABLE' | 'NOT_AVAILABLE' | 'ERROR';
  services: string[];
  fiberSpeeds?: string[];
  internetAir?: boolean;
  notes?: string;
}

export interface AddressInput {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

// Cache for browser instance (for serverless optimization)
let browser: Browser | null = null;

async function getBrowser() {
  if (browser) return browser;
  
  // For serverless environments, use chromium-min or similar
  browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  });
  
  return browser;
}

export async function checkATTAvalability(address: AddressInput): Promise<AvailabilityResult> {
  let page: Page | null = null;
  
  try {
    const browserInstance = await getBrowser();
    page = await browserInstance.newPage();
    
    // Set a reasonable timeout
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);
    
    // Navigate to AT&T availability checker
    await page.goto('https://www.att.com/internet/availability/', {
      waitUntil: 'networkidle',
    });
    
    // Wait for and fill the address form
    // Note: Selectors may need updating based on AT&T's actual site structure
    
    // Fill street address
    const streetInput = await page.waitForSelector('input[name="street"], input[placeholder*="street" i], input[id*="street" i]', { timeout: 10000 });
    if (streetInput) {
      await streetInput.fill(address.street);
    }
    
    // Fill city
    const cityInput = await page.$('input[name="city"], input[placeholder*="city" i], input[id*="city" i]');
    if (cityInput) {
      await cityInput.fill(address.city);
    }
    
    // Select state
    const stateSelect = await page.$('select[name="state"], select[id*="state" i]');
    if (stateSelect) {
      await stateSelect.selectOption(address.state);
    }
    
    // Fill ZIP code
    const zipInput = await page.$('input[name="zip"], input[name="zipCode"], input[placeholder*="zip" i], input[id*="zip" i]');
    if (zipInput) {
      await zipInput.fill(address.zipCode);
    }
    
    // Click check availability button
    const checkButton = await page.$('button[type="submit"], button:has-text("Check"), button:has-text("availability"), [data-testid*="check"]');
    if (checkButton) {
      await checkButton.click();
    }
    
    // Wait for results to load
    await page.waitForTimeout(5000);
    
    // Analyze results
    const result = await analyzeResults(page);
    
    return result;
    
  } catch (error) {
    console.error('Error checking AT&T availability:', error);
    return {
      status: 'ERROR',
      services: [],
      notes: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  } finally {
    if (page) {
      await page.close();
    }
  }
}

async function analyzeResults(page: Page): Promise<AvailabilityResult> {
  try {
    // Check for Fiber availability indicators
    const fiberIndicators = [
      'fiber is available',
      'at&t fiber',
      'fiber internet',
      'gigabit',
      'speeds up to',
    ];
    
    const pageContent = await page.content();
    const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
    
    const hasFiber = fiberIndicators.some(indicator => 
      pageText.includes(indicator.toLowerCase())
    );
    
    // Check for Internet Air
    const internetAirIndicators = [
      'internet air',
      'wireless internet',
      '5g home internet',
    ];
    
    const hasInternetAir = internetAirIndicators.some(indicator =>
      pageText.includes(indicator.toLowerCase())
    );
    
    // Extract fiber speeds if available
    let fiberSpeeds: string[] | undefined;
    if (hasFiber) {
      const speedMatches = pageText.match(/(\d+)\s*mbs/gi) || 
                          pageText.match(/(\d+)\s*mbps/gi) ||
                          pageText.match(/(\d+)\s*gbps/gi);
      if (speedMatches) {
        fiberSpeeds = speedMatches.map(s => s.replace(/[^\d]/g, ''));
      }
    }
    
    // Check for not available message
    const notAvailableIndicators = [
      'not available',
      "we're sorry",
      "doesn't appear",
      'unable to find',
    ];
    
    const notAvailable = notAvailableIndicators.some(indicator =>
      pageText.includes(indicator.toLowerCase())
    );
    
    if (hasFiber) {
      return {
        status: 'FIBER_AVAILABLE',
        services: ['fiber', 'internet'],
        fiberSpeeds,
        internetAir: hasInternetAir,
      };
    }
    
    if (hasInternetAir) {
      return {
        status: 'INTERNET_AIR_AVAILABLE',
        services: ['internet_air', 'internet'],
        internetAir: true,
      };
    }
    
    if (notAvailable) {
      return {
        status: 'NOT_AVAILABLE',
        services: [],
        notes: 'AT&T service is not available at this address',
      };
    }
    
    // If unclear, take screenshot for debugging
    return {
      status: 'ERROR',
      services: [],
      notes: 'Could not determine availability from page content',
    };
    
  } catch (error) {
    return {
      status: 'ERROR',
      services: [],
      notes: error instanceof Error ? error.message : 'Error analyzing results',
    };
  }
}

// Cleanup function for serverless environments
export async function cleanupBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
