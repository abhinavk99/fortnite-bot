const fortniteData = require('../src/fortniteData');
const constants = require('../src/constants');
const expect = require('chai').expect;

const user1 = '4,ycdoetnuid49';
const user2 = '.y4223lt3';

const platform = 'pc';

const NOT_FOUND_ERROR = Object.values(constants.ERRORS)[0];

describe('#Fortnite Data', () => {

  it('should have methods to get Fortnite data', () => {
    expect(fortniteData.getGlobalData).to.exist;
    expect(fortniteData.getModesData).to.exist;
    expect(fortniteData.getRecentData).to.exist;
    expect(fortniteData.getRoldData).to.exist;
    expect(fortniteData.getSeasonData).to.exist;
    expect(fortniteData.getRatingData).to.exist;
    expect(fortniteData.getKdData).to.exist;
  });

  it('should have methods to access the cache', () => {
    expect(fortniteData.setIdCache).to.exist;
    expect(fortniteData.getIdCache).to.exist;
  });

  it('should handle error for global with invalid username', async () => {
    try {
      await fortniteData.getGlobalData(user1, platform);
    } catch (err) {
      expect(err).to.equal(NOT_FOUND_ERROR);
    }
  });

  it('should handle error for modes with invalid username', async () => {
    try {
      await fortniteData.getModesData(user1, 'Solo', [10, 25], platform, '3');
    } catch (err) {
      expect(err).to.equal(NOT_FOUND_ERROR);
    }
  });

  it('should handle error for recent with invalid username', async () => {
    try {
      await fortniteData.getRecentData(user1, platform);
    } catch (err) {
      expect(err).to.equal(NOT_FOUND_ERROR);
    }
  });

  it('should handle error for rold with invalid username', async () => {
    try {
      await fortniteData.getRoldData(user1, platform);
    } catch (err) {
      expect(err).to.equal(NOT_FOUND_ERROR);
    }
  });

  it('should handle error for season with invalid username', async () => {
    try {
      await fortniteData.getSeasonData(user1, 3, platform);
    } catch (err) {
      expect(err).to.equal(NOT_FOUND_ERROR);
    }
  });

  it('should handle error for rating with invalid username', async () => {
    try {
      await fortniteData.getRatingData(user1, platform);
    } catch (err) {
      expect(err).to.equal(NOT_FOUND_ERROR);
    }
  });

  it('should handle error for kd with invalid username', async () => {
    try {
      await fortniteData.getKdData(user1, platform);
    } catch (err) {
      expect(err).to.equal(NOT_FOUND_ERROR);
    }
  });

  it('should handle error for compare with invalid username', async () => {
    try {
      await fortniteData.getCompareData(user1, user2, platform);
    } catch (err) {
      expect(err).to.equal(NOT_FOUND_ERROR);
    }
  });

  it('should get global data', async () => {
    const user = 'ninja';
    const res = await fortniteData.getGlobalData(user, platform);
    const lines = res.split('\n');
    expect(lines[0]).to.equal('Lifetime stats for Ninja:');
    expect(lines[1]).to.equal('Platform: PC');
    expect(lines[2]).to.equal('https://fortnitetracker.com/profile/pc/Ninja');

    expect(lines[4]).to.match(/^Matches played: \d+$/);
    expect(lines[5]).to.match(/^Wins: \d+$/);
    expect(lines[6]).to.match(/^Times in top 3\/5\/10: \d+$/);
    expect(lines[7]).to.match(/^Times in top 6\/12\/25: \d+$/);
    expect(lines[8]).to.match(/^Win Rate: \d+%$/);
    expect(lines[9]).to.match(/^Kills: \d+$/);
    expect(lines[10]).to.match(/^K\/D Ratio: \d+\.\d+$/);
    expect(lines[11]).to.match(/^Kills\/Game: \d+\.\d+$/);
    expect(lines[12]).to.match(/^Score: .+$/);

    expect(lines[14]).to.match(/^Solo matches played: \d+$/);
    expect(lines[15]).to.match(/^Solo wins: \d+$/);
    expect(lines[16]).to.match(/^Solo kills: \d+$/);

    expect(lines[18]).to.match(/^Duo matches played: \d+$/);
    expect(lines[19]).to.match(/^Duo wins: \d+$/);
    expect(lines[20]).to.match(/^Duo kills: \d+$/);

    expect(lines[22]).to.match(/^Squad matches played: \d+$/);
    expect(lines[23]).to.match(/^Squad wins: \d+$/);
    expect(lines[24]).to.match(/^Squad kills: \d+$/);
  });

  it('should get solo season 3 data', async () => {
    const user = 'ninja';
    const mode = 'Solos3';
    const nums = constants.SOLOS3.top;
    const season = '3';
    const res = await fortniteData.getModesData(user, mode, nums, platform, season);
    expect(res).to.equal(`Season 3 Solo stats for Ninja:
Platform: PC

Matches played: 1064
Wins: 412
Times in top 10: 511
Times in top 25: 594
Win Rate: 38.70%
Kills: 8180
K/D Ratio: 12.55
Kills/Game: 7.69
TRN Rating: 4,979
Score: 377,781
Score/Match: 355.06\n`);
  });

  it('should get recent data', async () => {
    const user = 'ninja';
    const res = await fortniteData.getRecentData(user, platform);
    expect(res.length).to.equal(2);
    expect(res[0]).to.equal('Recent matches for Ninja:\nPlatform: PC');
    expect(res[1].length).to.equal(5);
    for (let mode of res[1][0].slice(1)) {
      expect(mode).to.match(/^(Solo|Duo|Squad)$/);
    }
    for (let mode of res[1][1].slice(1)) {
      expect(mode).to.match(/^\d+ match(es)?$/);
    }
    for (let mode of res[1][2].slice(1)) {
      expect(mode).to.match(/^\d+ win(s)?$/);
    }
    for (let mode of res[1][3].slice(1)) {
      expect(mode).to.match(/^\d+ kill(s)?$/);
    }
    for (let mode of res[1][4].slice(1)) {
      expect(mode).to.match(/^.+ ago$/);
    }
  });

  it('should get recent data in old format', async () => {
    const user = 'ninja';
    const res = await fortniteData.getRoldData(user, platform);
    let lines = res.substring(0, res.length - 1).split('\n');
    expect(lines[0]).to.equal('Recent matches for Ninja:');
    expect(lines[1]).to.equal('Platform: PC');
    lines = lines.slice(3);
    for (let line of lines) {
      expect(line).to.match(
        /^(Solo|Duo|Squad) - \d+ match(es)? - \d+ win(s)? - \d+ kill(s)? - .+ ago$/
      );
    }
  });

  it('should get season 3 data', async () => {
    const user = 'ninja';
    const season = '3';
    const res = await fortniteData.getSeasonData(user, season, platform);
    expect(res).to.equal(`Season 3 stats for Ninja:
Platform: PC

Matches played: 2444
Wins: 1014
Times in top 3/5/10: 1202
Times in top 6/12/25: 1387
Win Rate: 41.49%
Kills: 18475
K/D Ratio: 12.92
Kills/Game: 7.56

Solo matches played: 1064
Solo wins: 412
Solo kills: 8180

Duo matches played: 951
Duo wins: 480
Duo kills: 7410

Squad matches played: 429
Squad wins: 122
Squad kills: 2885\n`);
  });

  it('should get TRN rating data', async () => {
    const user = 'ninja';
    const res = await fortniteData.getRatingData(user, platform);
    const lines = res.split('\n');
    expect(lines[0]).to.equal('TRN Rating stats for Ninja:');
    expect(lines[1]).to.equal('Platform: PC');

    expect(lines[3]).to.match(/^Solo TRN Rating: .+$/);
    expect(lines[4]).to.match(/^Duo TRN Rating: .+$/);
    expect(lines[5]).to.match(/^Squad TRN Rating: .+$/);

    expect(lines[7]).to.match(/^Season 3 Solo TRN Rating: .+$/);
    expect(lines[8]).to.match(/^Season 3 Duo TRN Rating: .+$/);
    expect(lines[9]).to.match(/^Season 3 Squad TRN Rating: .+$/);

    expect(lines[11]).to.match(/^Season 4 Solo TRN Rating: .+$/);
    expect(lines[12]).to.match(/^Season 4 Duo TRN Rating: .+$/);
    expect(lines[13]).to.match(/^Season 4 Squad TRN Rating: .+$/);
  });

  it('should get K/D data', async () => {
    const user = 'ninja';
    const res = await fortniteData.getKdData(user, platform);
    const lines = res.split('\n');
    expect(lines[0]).to.equal('K/D Ratios for Ninja:');
    expect(lines[1]).to.equal('Platform: PC');

    expect(lines[3]).to.match(/^Solo K\/D Ratio: .+$/);
    expect(lines[4]).to.match(/^Duo K\/D Ratio: .+$/);
    expect(lines[5]).to.match(/^Squad K\/D Ratio: .+$/);
    expect(lines[6]).to.match(/^Lifetime K\/D Ratio: .+$/);

    expect(lines[8]).to.equal('Season 3 Solo K/D Ratio: 12.55');
    expect(lines[9]).to.equal('Season 3 Duo K/D Ratio: 15.73');
    expect(lines[10]).to.equal('Season 3 Squad K/D Ratio: 9.40');
    expect(lines[11]).to.equal('Season 3 K/D Ratio: 12.92');

    expect(lines[13]).to.match(/^Season 4 Solo K\/D Ratio: .+$/);
    expect(lines[14]).to.match(/^Season 4 Duo K\/D Ratio: .+$/);
    expect(lines[15]).to.match(/^Season 4 Squad K\/D Ratio: .+$/);
    expect(lines[16]).to.match(/^Season 4 K\/D Ratio: .+$/);
  });

  it('should get comparing data', async () => {
    const username1 = 'ninja';
    const username2 = 'TSM_Myth';
    const res = await fortniteData.getCompareData(username1, username2, platform);
    expect(res.length).to.equal(2);
    expect(res[0]).to.equal(`Ninja vs TSM_Myth
Platform: PC
https://fortnitetracker.com/profile/pc/Ninja
https://fortnitetracker.com/profile/pc/TSM_Myth`);

    expect(res[1].length).to.equal(3);
    expect(res[1][0]).to.eql([
      'User',
      'Matches played',
      'Wins',
      'Times in top 3/5/10',
      'Times in top 6/12/25',
      'Win Rate',
      'Kills',
      'K/D Ratio',
      'Kills/Game',
      'Score',
      '',
      'Solo matches played',
      'Solo wins',
      'Solo kills',
      '',
      'Duo matches played',
      'Duo wins',
      'Duo kills',
      '',
      'Squad matches played',
      'Squad wins',
      'Squad kills'
    ]);
    expect(res[1][1]).to.have.a.lengthOf(22);
    expect(res[1][2]).to.have.a.lengthOf(22);
  });

});