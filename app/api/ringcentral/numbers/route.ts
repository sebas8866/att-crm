import { NextRequest, NextResponse } from 'next/server'
import { getPhoneNumbers } from '@/lib/sms'

export const dynamic = 'force-dynamic'

// SAFETY: READ ONLY endpoint - only gets phone numbers, never modifies
export async function GET() {
  try {
    console.log('Checking RingCentral phone numbers (READ ONLY)...')
    
    const result = await getPhoneNumbers()
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Failed to get phone numbers'
      }, { status: 500 })
    }
    
    // SAFETY: Filter to show only our authorized number details
    const authorizedNumber = '+18007209957'
    const ourNumber = result.numbers?.find(n => n.phoneNumber === authorizedNumber)
    
    return NextResponse.json({
      success: true,
      authorizedNumber: ourNumber || { phoneNumber: authorizedNumber, note: 'Number configured but not found in account' },
      totalNumbers: result.numbers?.length || 0,
      allNumbers: result.numbers?.map(n => n.phoneNumber),
      message: 'Phone numbers retrieved successfully',
      safetyNotice: 'This endpoint is READ ONLY - no numbers were modified'
    })
  } catch (error) {
    console.error('RingCentral phone numbers error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
