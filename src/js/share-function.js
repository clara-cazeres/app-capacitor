import { Share } from '@capacitor/share';

export function configurarShareButton(page, productoId){
    const shareButton = page.querySelector("#btn-share");
    shareButton.addEventListener("click", async () => {
        await Share.share({
            title: 'Compartir',
            text: 'Mira este producto!',
            url: `http://localhost:3000/${productoId}`,
            dialogTitle: 'Compartir producto',
          });
    });
};
