const fortniteData = require('../src/fortniteData');
const modes = require('../src/utils/modes');
const expect = require('chai').expect;

const user1 = '4,ycdoetnuid49';
const user2 = '.y4223lt3';

const platform = 'pc';

const NOT_FOUND_ERROR = `User ${user1} not found.`;
const COMPARE_NOT_FOUND_ERROR = `User ${user1} or ${user2} not found.`;

describe('#Fortnite Data', () => {

  it('should have methods to get Fortnite data', () => {
    expect(fortniteData.getData).to.exist;
    expect(fortniteData.getCompareData).to.exist;
  });

  it('should have methods to access the cache', () => {
    expect(fortniteData.setIdCache).to.exist;
    expect(fortniteData.getIdCache).to.exist;
  });

  it('should handle error for global with invalid username', async () => {
    try {
      await fortniteData.getData('Global', user1, platform);
    } catch (err) {
      expect(err).to.equal(NOT_FOUND_ERROR);
    }
  });

  it('should handle error for modes with invalid username', async () => {
    try {
      await fortniteData.getData('Modes', user1, platform, {
        mode: 'Solo',
        top: [10, 25],
        season: '4'
      });
    } catch (err) {
      expect(err).to.equal(NOT_FOUND_ERROR);
    }
  });

  it('should handle error for recent with invalid username', async () => {
    try {
      await fortniteData.getData('Recent', user1, platform);
    } catch (err) {
      expect(err).to.equal(NOT_FOUND_ERROR);
    }
  });

  it('should handle error for rold with invalid username', async () => {
    try {
      await fortniteData.getData('Rold', user1, platform);
    } catch (err) {
      expect(err).to.equal(NOT_FOUND_ERROR);
    }
  });

  it('should handle error for season with invalid username', async () => {
    try {
      await fortniteData.getData('Season', user1, platform, { season: '4' });
    } catch (err) {
      expect(err).to.equal(NOT_FOUND_ERROR);
    }
  });

  it('should handle error for rating with invalid username', async () => {
    try {
      await fortniteData.getData('Rating', user1, platform);
    } catch (err) {
      expect(err).to.equal(NOT_FOUND_ERROR);
    }
  });

  it('should handle error for kd with invalid username', async () => {
    try {
      await fortniteData.getData('Kd', user1, platform);
    } catch (err) {
      expect(err).to.equal(NOT_FOUND_ERROR);
    }
  });

  it('should handle error for compare with invalid username', async () => {
    try {
      await fortniteData.getCompareData(user1, user2, platform);
    } catch (err) {
      expect(err).to.equal(COMPARE_NOT_FOUND_ERROR);
    }
  });

  it('should get global data', async () => {
    const user = 'ninja';
    const res = await fortniteData.getData('Global', user, platform);
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

  it('should get solo season 4 data', async () => {
    const user = 'ninja';
    const mode = 'Solos4';
    const top = modes.SOLOS4.top;
    const season = '4';
    const res = await fortniteData.getData('Modes', user, platform, {
      mode: mode,
      top: top,
      season: season
    });
    const lines = res.split('\n');
    expect(lines[0]).to.equal('Season 4 Solo stats for Ninja:');
    expect(lines[1]).to.equal('Platform: PC');

    expect(lines[3]).to.match(/^Matches played: \d+$/);
    expect(lines[4]).to.match(/^Wins: \d+$/);
    expect(lines[5]).to.match(/^Times in top 10: \d+$/);
    expect(lines[6]).to.match(/^Times in top 25: \d+$/);
    expect(lines[7]).to.match(/^Win Rate: .+%$/);
    expect(lines[8]).to.match(/^Kills: \d+$/);
    expect(lines[9]).to.match(/^K\/D Ratio: \d+\.\d+$/);
    expect(lines[10]).to.match(/^Kills\/Game: \d+\.\d+$/);
    expect(lines[11]).to.match(/^TRN Rating: .+$/)
    expect(lines[12]).to.match(/^Score: .+$/);
    expect(lines[13]).to.match(/^Score\/Match: .+$/);
  });

  it('should get recent data', async () => {
    const user = 'ninja';
    const res = await fortniteData.getData('Recent', user, platform);
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
    const res = await fortniteData.getData('Rold', user, platform);
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

  it('should get season 4 data', async () => {
    const user = 'ninja';
    const season = '4';
    const res = await fortniteData.getData('Season', user, platform, { season: season });
    const lines = res.split('\n');
    expect(lines[0]).to.equal('Season 4 stats for Ninja:');
    expect(lines[1]).to.equal('Platform: PC');

    expect(lines[3]).to.match(/^Matches played: \d+$/);
    expect(lines[4]).to.match(/^Wins: \d+$/);
    expect(lines[5]).to.match(/^Times in top 3\/5\/10: \d+$/);
    expect(lines[6]).to.match(/^Times in top 6\/12\/25: \d+$/);
    expect(lines[7]).to.match(/^Win Rate: .+%$/);
    expect(lines[8]).to.match(/^Kills: \d+$/);
    expect(lines[9]).to.match(/^K\/D Ratio: \d+\.\d+$/);
    expect(lines[10]).to.match(/^Kills\/Game: \d+\.\d+$/);

    expect(lines[12]).to.match(/^Solo matches played: \d+$/);
    expect(lines[13]).to.match(/^Solo wins: \d+$/);
    expect(lines[14]).to.match(/^Solo kills: \d+$/);

    expect(lines[16]).to.match(/^Duo matches played: \d+$/);
    expect(lines[17]).to.match(/^Duo wins: \d+$/);
    expect(lines[18]).to.match(/^Duo kills: \d+$/);

    expect(lines[20]).to.match(/^Squad matches played: \d+$/);
    expect(lines[21]).to.match(/^Squad wins: \d+$/);
    expect(lines[22]).to.match(/^Squad kills: \d+$/);
  });

  it('should get TRN rating data', async () => {
    const user = 'ninja';
    const res = await fortniteData.getData('Rating', user, platform);
    const lines = res.split('\n');
    expect(lines[0]).to.equal('TRN Rating stats for Ninja:');
    expect(lines[1]).to.equal('Platform: PC');

    expect(lines[3]).to.match(/^Solo TRN Rating: .+$/);
    expect(lines[4]).to.match(/^Duo TRN Rating: .+$/);
    expect(lines[5]).to.match(/^Squad TRN Rating: .+$/);

    expect(lines[7]).to.match(/^Season 4 Solo TRN Rating: .+$/);
    expect(lines[8]).to.match(/^Season 4 Duo TRN Rating: .+$/);
    expect(lines[9]).to.match(/^Season 4 Squad TRN Rating: .+$/);

    expect(lines[11]).to.match(/^Season 5 Solo TRN Rating: .+$/);
    expect(lines[12]).to.match(/^Season 5 Duo TRN Rating: .+$/);
    expect(lines[13]).to.match(/^Season 5 Squad TRN Rating: .+$/);
  });

  it('should get K/D data', async () => {
    const user = 'ninja';
    const res = await fortniteData.getData('Kd', user, platform);
    const lines = res.split('\n');
    expect(lines[0]).to.equal('K/D Ratios for Ninja:');
    expect(lines[1]).to.equal('Platform: PC');

    expect(lines[3]).to.match(/^Solo K\/D Ratio: .+$/);
    expect(lines[4]).to.match(/^Duo K\/D Ratio: .+$/);
    expect(lines[5]).to.match(/^Squad K\/D Ratio: .+$/);
    expect(lines[6]).to.match(/^Lifetime K\/D Ratio: .+$/);

    expect(lines[8]).to.match(/^Season 4 Solo K\/D Ratio: .+$/);
    expect(lines[9]).to.match(/^Season 4 Duo K\/D Ratio: .+$/);
    expect(lines[10]).to.match(/^Season 4 Squad K\/D Ratio: .+$/);
    expect(lines[11]).to.match(/^Season 4 K\/D Ratio: .+$/);

    expect(lines[13]).to.match(/^Season 5 Solo K\/D Ratio: .+$/);
    expect(lines[14]).to.match(/^Season 5 Duo K\/D Ratio: .+$/);
    expect(lines[15]).to.match(/^Season 5 Squad K\/D Ratio: .+$/);
    expect(lines[16]).to.match(/^Season 5 K\/D Ratio: .+$/);
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