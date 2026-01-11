import { EmbedBuilder } from 'discord.js';
import { fmtVNDate, humanizeDuration } from './util.js';

export function statusEmoji(status) {
  if (status === 'OK') return '🟢';
  if (status === 'DIE') return '🔴';
  return '🟡';
}

export function platformLabel(p) {
  return p === 'tiktok' ? 'TIKTOK V2' : 'FACEBOOK';
}

export function buildStatusEmbed(item, check) {
  const created = item.createdAt ? fmtVNDate(item.createdAt) : '—';
  const last = check?.checkedAt ? fmtVNDate(check.checkedAt) : (item.lastCheckedAt ? fmtVNDate(item.lastCheckedAt) : '—');

  let lived = 'Chưa rõ thời điểm bắt đầu';
  if (item.createdAt && (check?.status === 'OK' || item.lastStatus === 'OK')) {
    const ms = Date.now() - new Date(item.createdAt).getTime();
    lived = humanizeDuration(ms);
  }

  const e = new EmbedBuilder()
    .setTitle(`${statusEmoji(check.status)} ${platformLabel(item.platform)}`)
    .setDescription(item.url)
    .addFields(
      { name: '👤 User', value: item.display || item.key || '—', inline: false },
      { name: '🪪 Tên', value: item.name || 'Không rõ 💗', inline: false },
      { name: '👥 Follow', value: item.follower ? String(item.follower) : 'Không rõ', inline: true },
      { name: '💰 Giá', value: item.price != null ? String(item.price) : '0', inline: true },
      { name: '📝 Ghi chú', value: item.note || '—', inline: false },
      { name: '⏳ Đã sống được', value: lived, inline: false },
      { name: '🆕 Tạo', value: created, inline: true },
      { name: '🔁 Check gần đây', value: last, inline: true },
      { name: '🔎 Trạng thái', value: `**${check.status}**  \`${check.reason || '—'}\``, inline: false },
      { name: '🆔 ID nội bộ', value: `\`${item.id}\``, inline: false },
    );
  return e;
}

export function buildListEmbed(items) {
  const e = new EmbedBuilder().setTitle('📋 Danh sách đang theo dõi');
  if (!items.length) {
    e.setDescription('Chưa có mục nào. Dùng `/menu` hoặc `/tiktok_add` / `/fb_add`.');
    return e;
  }
  const lines = items.slice(0, 25).map((x, i) => {
    const st = x.lastStatus || '—';
    return `${i+1}. \`${x.id}\` • **${platformLabel(x.platform)}** • ${x.display || x.key} • ${statusEmoji(st)} **${st}**`;
  });
  e.setDescription(lines.join('\n'));
  e.setFooter({ text: `Tổng: ${items.length}` });
  return e;
}
