import re

with open('users.html', 'r', encoding='utf-8') as f:
    content = f.read()

modal_code = '''
    <!-- Video Modal -->
    <div class="modal" id="videoModal" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); z-index: 11000; align-items: center; justify-content: center; padding: 20px;">
        <div class="modal-content" style="max-width: 800px; width: 100%; padding: 0; background: transparent; box-shadow: none;">
            <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
                <button type="button" onclick="closeVideoModal()" style="background: rgba(255,255,255,0.2); border: none; font-size: 24px; color: white; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div style="background: black; border-radius: 12px; overflow: hidden; position: relative; padding-top: 56.25%;">
                <video id="equipmentVideoPlayer" controls style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                    <source src="" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    </div>

    <script>
        function openVideoModal(videoUrl) {
            const modal = document.getElementById('videoModal');
            const player = document.getElementById('equipmentVideoPlayer');
            player.src = videoUrl;
            modal.style.display = 'flex';
            player.play().catch(e => console.log('Autoplay blocked:', e));
        }
        function closeVideoModal() {
            const modal = document.getElementById('videoModal');
            const player = document.getElementById('equipmentVideoPlayer');
            player.pause();
            player.src = '';
            modal.style.display = 'none';
        }
    </script>
    <script src="/js/users.js?v='''

content = re.sub(
    r'<script src="/js/users\.js\?v=',
    modal_code,
    content,
    flags=re.MULTILINE
)

with open('users.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done!")
