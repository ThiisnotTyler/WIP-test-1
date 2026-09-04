const fs = require('fs');
let code = fs.readFileSync('src/components/ChannelGuide.tsx', 'utf8');

const target = `<div className="flex flex-col flex-1">
              {channels.map((ch, idx) => (
                <div key={ch.id + idx} className="flex border-b border-panel-border hover:bg-panel">`;

const replacement = `<div 
              className="flex flex-col flex-1"
              style={{
                height: \`\${rowVirtualizer.getTotalSize()}px\`,
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const ch = channels[virtualRow.index];
                return (
                  <div
                    key={ch.id + virtualRow.index}
                    className="flex border-b border-panel-border hover:bg-panel"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: \`\${virtualRow.size}px\`,
                      transform: \`translateY(\${virtualRow.start}px)\`,
                    }}
                  >`;

code = code.replace(target, replacement);

const targetEnd = `                  </div>
                </div>
              ))}
            </div>`;

const replacementEnd = `                  </div>
                </div>
                );
              })}
            </div>`;

code = code.replace(targetEnd, replacementEnd);

fs.writeFileSync('src/components/ChannelGuide.tsx', code);
