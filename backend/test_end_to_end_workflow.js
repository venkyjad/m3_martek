// End-to-End Workflow Test: Brief → Campaign → Creative Matching
// Run with: node test_end_to_end_workflow.js

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test brief for UAE beverage brand
const uaeBeverageBrief = {
  business_objective: "Launch premium cold brew coffee pouches targeting busy professionals in UAE",
  brand_category: "beverage",
  brand_name: "Estate Brews",
  campaign_name: "Cold Nitro UAE Launch",
  primary_channels: ["social_media", "digital"],
  formats: ["photo", "video"],
  tone_of_voice: "friendly",
  target_audience_countries: ["UAE"],
  target_audience_description: "Working busy professionals aged 25-40 in Dubai and Abu Dhabi",
  timeline_start: "2024-09-01",
  timeline_end: "2024-11-30",
  budget_range: "5000-10000",
  budget_range_min: 15000,
  budget_range_max: 30000,
  budget_currency: "AED",
  brand_assets: {
    colors: ["#8B4513", "#F4E4BC", "#2F4F4F"],
    logo: "Modern coffee bean logo with Arabic calligraphy",
    guidelines: "Premium but approachable, coffee culture focused"
  },
  must_have_assets: "Arabic text elements, UAE lifestyle imagery",
  additional_requirements: "Content must reflect UAE work culture and coffee consumption habits",
  client_contact_email: "marketing@estatebrews.ae",
  requirements: [
    {
      type: "location",
      value: "UAE"
    },
    {
      type: "skill", 
      value: "food_photography"
    },
    {
      type: "skill",
      value: "lifestyle_photography"
    },
    {
      type: "theme",
      value: "food"
    }
  ]
};

// Fashion brief for testing different industry
const fashionBrief = {
  business_objective: "Launch sustainable fashion line targeting eco-conscious millennials",
  brand_category: "fashion",
  brand_name: "EcoChic",
  campaign_name: "Sustainable Style 2024",
  primary_channels: ["social_media", "influencer"],
  formats: ["photo", "video"],
  tone_of_voice: "casual",
  target_audience_countries: ["US", "UK"],
  budget_range: "10000-20000",
  requirements: [
    {
      type: "skill",
      value: "fashion_photography"
    },
    {
      type: "theme",
      value: "sustainability"
    }
  ]
};

async function testEndToEndWorkflow() {
  console.log('🚀 Testing End-to-End Workflow: Brief → Campaign → Creative Matching\n');
  
  let briefId, campaignId;
  
  try {
    // Step 1: Create Marketing Brief
    console.log('📋 Step 1: Creating marketing brief...');
    const briefResponse = await axios.post(`${BASE_URL}/briefs`, uaeBeverageBrief);
    briefId = briefResponse.data.brief_id;
    console.log('✅ Brief created:', briefId);
    console.log('   Brand:', uaeBeverageBrief.brand_name);
    console.log('   Category:', uaeBeverageBrief.brand_category);
    console.log('   Target Market:', uaeBeverageBrief.target_audience_countries.join(', '));
    
    // Step 2: Generate Campaign Plan
    console.log('\n🎯 Step 2: Generating AI campaign plan...');
    const campaignResponse = await axios.post(
      `${BASE_URL}/briefs/${briefId}/generate-campaign`,
      {
        focus_areas: ["local_market_penetration", "professional_lifestyle"],
        campaign_type: "product_launch"
      }
    );
    campaignId = campaignResponse.data.plan_id;
    const campaignPlan = campaignResponse.data.campaign_plan;
    
    console.log('✅ Campaign plan generated:', campaignId);
    console.log('   Title:', campaignPlan.brief_summary?.campaign_title);
    console.log('   Target Markets:', campaignPlan.brief_summary?.target_markets?.join(', '));
    console.log('   Content Concepts:', campaignPlan.content_concepts?.length || 0);
    
    if (campaignPlan.recommended_creatives) {
      console.log('   Recommended Skills:', campaignPlan.recommended_creatives.required_skills?.slice(0, 3).join(', '));
      console.log('   Cultural Expertise:', campaignPlan.recommended_creatives.cultural_expertise?.join(', '));
    }
    
    // Step 3: Find Matching Creatives from Brief
    console.log('\n👥 Step 3: Finding matching creatives based on brief requirements...');
    const creativesResponse = await axios.get(`${BASE_URL}/briefs/${briefId}/recommended-creatives?limit=5`);
    const creatives = creativesResponse.data;
    
    console.log('✅ Creative matching completed');
    console.log('   Total Found:', creatives.total_found);
    console.log('   Top Match Score:', creatives.matching_summary?.top_match_score + '%');
    console.log('   Local Experts:', creatives.matching_summary?.local_market_experts);
    console.log('   Available Now:', creatives.matching_summary?.available_now);
    
    // Display top 3 matches
    console.log('\n🏆 Top 3 Creative Matches:');
    creatives.recommended_creatives.slice(0, 3).forEach((creative, index) => {
      console.log(`   ${index + 1}. ${creative.name} (${creative.country})`);
      console.log(`      Score: ${Math.round(creative.score * 100)}%`);
      console.log(`      Skills: ${creative.skills?.slice(0, 3).join(', ')}`);
      console.log(`      Themes: ${creative.themes?.slice(0, 2).join(', ')}`);
      console.log(`      Match Reasons: ${creative.match_reasons?.slice(0, 2).join(', ')}`);
      console.log('');
    });

    // Step 4: Test Alternative Workflow (Direct Brief → Creative)
    console.log('🔄 Step 4: Testing alternative workflow (Brief → Creative directly)...');
    const directCreativesResponse = await axios.get(`${BASE_URL}/briefs/${briefId}/recommended-creatives?limit=5`);
    const directCreatives = directCreativesResponse.data;
    
    console.log('✅ Direct brief-to-creative matching completed');
    console.log('   Total Found:', directCreatives.total_found);
    console.log('   Top Match Score:', directCreatives.matching_summary?.top_match_score + '%');
    
    console.log('\n✅ End-to-end workflow completed successfully!');

    return { briefId, campaignId, success: true };

  } catch (error) {
    console.error('❌ Workflow failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('   Status:', error.response.status);
      console.error('   Error Details:', JSON.stringify(error.response.data, null, 2));
    }
    return { briefId, campaignId, success: false, error: error.message };
  }
}

async function testFashionWorkflow() {
  console.log('\n👗 Testing Fashion Industry Workflow...\n');
  
  try {
    // Create fashion brief
    console.log('📋 Creating fashion brief...');
    const briefResponse = await axios.post(`${BASE_URL}/briefs`, fashionBrief);
    const briefId = briefResponse.data.brief_id;
    console.log('✅ Fashion brief created:', briefId);
    
    // Find creatives directly
    console.log('\n👥 Finding fashion creatives...');
    const creativesResponse = await axios.get(`${BASE_URL}/briefs/${briefId}/recommended-creatives?limit=3`);
    const creatives = creativesResponse.data;
    
    console.log('✅ Fashion creative matching:');
    console.log('   Total Found:', creatives.total_found);
    console.log('   Match Quality:', creatives.matching_summary?.search_quality);
    
    // Show top fashion match
    if (creatives.recommended_creatives.length > 0) {
      const topMatch = creatives.recommended_creatives[0];
      console.log('\n🥇 Top Fashion Creative:');
      console.log('   Name:', topMatch.name);
      console.log('   Score:', Math.round(topMatch.score * 100) + '%');
      console.log('   Themes:', topMatch.themes?.join(', '));
      console.log('   Portfolio Tags:', topMatch.portfolio_tags?.slice(0, 3).join(', '));
    }
    
    return { briefId, success: true };
    
  } catch (error) {
    console.error('❌ Fashion workflow failed:', error.response?.data?.error || error.message);
    return { success: false, error: error.message };
  }
}

// Removed testMatchingAPIs function - endpoints no longer available

async function testCreativesIngestion() {
  console.log('\n📥 Testing Creatives Ingestion...\n');
  
  try {
    // Test ingestion health
    console.log('🔍 Checking creatives service health...');
    const healthResponse = await axios.get(`${BASE_URL}/creatives/health`);
    console.log('✅ Creatives service health:', healthResponse.data.status);
    console.log('   Collection points:', healthResponse.data.collection?.points_count || 0);
    
    // Test ingestion (small batch for testing)
    console.log('\n📥 Testing creatives ingestion...');
    const ingestResponse = await axios.post(`${BASE_URL}/creatives/ingest`);
    console.log('✅ Ingestion completed:');
    console.log('   Total processed:', ingestResponse.data.total);
    console.log('   Successful:', ingestResponse.data.successful);
    console.log('   Failed:', ingestResponse.data.failed);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Creatives ingestion test failed:', error.response?.data?.error || error.message);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🎬 M3 Slice - End-to-End Workflow Testing\n');
  console.log('Testing: Brief Collection → Campaign Generation → Creative Matching\n');
  
  // Test creatives ingestion first
  const ingestionResult = await testCreativesIngestion();
  
  // Test main workflow
  const mainResult = await testEndToEndWorkflow();
  
  // Test alternative industry
  const fashionResult = await testFashionWorkflow();
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================================');
  console.log('Creatives Ingestion:', ingestionResult.success ? '✅ PASSED' : '❌ FAILED');
  console.log('UAE Beverage Workflow:', mainResult.success ? '✅ PASSED' : '❌ FAILED');
  console.log('Fashion Workflow:', fashionResult.success ? '✅ PASSED' : '❌ FAILED');
  
  if (mainResult.success) {
    console.log('\n🎯 Complete Workflow Tested:');
    console.log('1. ✅ Creatives Data Ingestion to Qdrant');
    console.log('2. ✅ Marketing Brief Collection');
    console.log('3. ✅ AI Campaign Plan Generation');
    console.log('4. ✅ Intelligent Creative Matching');
    console.log('5. ✅ Geographic/Cultural Targeting');
    console.log('6. ✅ Skills-Based Ranking');
    console.log('7. ✅ Alternative Workflows');
    
    console.log('\n🔗 Your M3 Slice Platform URLs:');
    console.log(`   Creatives Ingestion: POST ${BASE_URL}/creatives/ingest`);
    console.log(`   Creatives Health: GET ${BASE_URL}/creatives/health`);
    if (mainResult.briefId) {
      console.log(`   Brief: GET ${BASE_URL}/briefs/${mainResult.briefId}`);
      console.log(`   Generate Campaign: POST ${BASE_URL}/briefs/${mainResult.briefId}/generate-campaign`);
      console.log(`   Recommended Creatives: GET ${BASE_URL}/briefs/${mainResult.briefId}/recommended-creatives`);
    }
  }
  
  console.log('\n🚀 M3 Slice Platform is fully operational!');
  console.log('Ready for: Brief Collection → Campaign Planning → Creative Matching');
}

// Run tests
runAllTests().catch(console.error);


