import { NextRequest, NextResponse } from 'next/server';

const MAIN_SITE_URL = 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    // Ana siteden sistem durumu bilgilerini çek
    const [statusResponse, healthResponse, usersResponse] = await Promise.allSettled([
      fetch(`${MAIN_SITE_URL}/api/system/status`),
      fetch(`${MAIN_SITE_URL}/api/system/health-score`),
      fetch(`${MAIN_SITE_URL}/api/system/active-users`)
    ]);

    const systemData: any = {
      serverStatus: 'Bağlantı Hatası',
      version: 'Bilinmiyor',
      uptime: 0,
      memory: { usage: 0 },
      cpu: { usage: 0 },
      disk: { usage: 0 },
      database: { status: 'Bağlantı Hatası', userCount: 0 },
      healthScore: 0,
      healthStatus: 'Bilinmiyor',
      activeUsers: 0,
      totalUsers: 0,
      lastUpdate: new Date().toISOString()
    };

    // Sistem durumu bilgileri
    if (statusResponse.status === 'fulfilled' && statusResponse.value.ok) {
      const statusData = await statusResponse.value.json();
      if (statusData.success) {
        systemData.serverStatus = statusData.data.serverStatus === 'active' ? 'Aktif' : 'Pasif';
        systemData.version = statusData.data.version;
        systemData.uptime = statusData.data.uptime;
        systemData.memory = {
          usage: Math.round(statusData.data.memory.usage),
          total: statusData.data.memory.total,
          free: statusData.data.memory.free
        };
        systemData.cpu = {
          usage: Math.round((statusData.data.cpu.loadAverage[0] / statusData.data.cpu.cores) * 100),
          cores: statusData.data.cpu.cores,
          model: statusData.data.cpu.model
        };
        systemData.database = {
          status: statusData.data.database.status === 'connected' ? 'Bağlı' : 'Bağlantı Hatası',
          userCount: statusData.data.database.userCount,
          reservationCount: statusData.data.database.reservationCount,
          paymentCount: statusData.data.database.paymentCount
        };
      }
    }

    // Sağlık skoru bilgileri
    if (healthResponse.status === 'fulfilled' && healthResponse.value.ok) {
      const healthData = await healthResponse.value.json();
      if (healthData.success) {
        systemData.healthScore = Math.round(healthData.data.score);
        systemData.healthStatus = healthData.data.status;
        systemData.healthIssues = healthData.data.issues;
        systemData.metrics = healthData.data.metrics;
      }
    }

    // Kullanıcı bilgileri
    if (usersResponse.status === 'fulfilled' && usersResponse.value.ok) {
      const usersData = await usersResponse.value.json();
      if (usersData.success) {
        systemData.activeUsers = usersData.data.activeUsers;
        systemData.totalUsers = usersData.data.totalUsers;
        systemData.activeUsers24h = usersData.data.activeUsers24h;
        systemData.newUsers7Days = usersData.data.newUsers7Days;
      }
    }

    return NextResponse.json({
      success: true,
      data: systemData
    });

  } catch (error) {
    console.error('Main site status fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ana site durumu alınamadı' 
      },
      { status: 500 }
    );
  }
}

