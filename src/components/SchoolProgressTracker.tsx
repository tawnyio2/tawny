import React, { useState, useEffect, useRef } from 'react';

const SchoolProgressTracker: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const updateProgress = () => {
      const startDate = new Date('2025-09-01');
      const endDate = new Date('2026-07-04');
      const currentDate = new Date();

      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const elapsedDays = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const progressPercentage = Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100));
      const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      setProgress(progressPercentage);
      setDaysRemaining(remainingDays);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);

    return () => clearInterval(interval);
  }, []);

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  };

  const contentStyle: React.CSSProperties = {
    textAlign: 'center',
    maxWidth: '28rem',
    width: '100%'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '2rem',
    lineHeight: '1.2'
  };

  const yellowTextStyle: React.CSSProperties = {
    color: '#F6E05E'
  };

  const progressContainerStyle: React.CSSProperties = {
    marginBottom: '2rem'
  };

  const progressBarBgStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#374151',
    borderRadius: '9999px',
    height: '1.5rem',
    border: '2px solid white'
  };

  const progressBarFillStyle: React.CSSProperties = {
    backgroundColor: 'white',
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 1s ease-out',
    width: `${progress}%`
  };

  const countdownStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'white'
  };

  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: isRecording ? '#EF4444' : '#10B981',
    color: 'white',
    border: 'none',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease'
  };

  const startVideoCapture = async () => {
    if (!containerRef.current) return;

    try {
      setIsRecording(true);
      chunksRef.current = [];

      // Créer un canvas pour capturer le contenu
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Format vertical Full HD (9:16 ratio)
      canvas.width = 1080;
      canvas.height = 1920;

      // Variables pour l'animation
      const targetProgress = progress;
      const targetDaysRemaining = daysRemaining;
      let animatedProgress = 0;
      let animatedDays = targetDaysRemaining; // Commencer directement au nombre de jours restants
      let startTime = Date.now();
      
      // Durée totale fixe de 20 secondes
      const totalVideoDuration = 20;
      // Calculer la durée d'animation proportionnelle au pourcentage (30% à 70% de la durée totale)
      const animationDuration = Math.max(6, Math.min(14, (targetProgress / 100) * 8 + 6));

      // Fonction pour dessiner le contenu sur le canvas
      const drawFrame = () => {
        if (!ctx || !containerRef.current) return;
        
        const elapsed = Date.now() - startTime;
        const elapsedSeconds = elapsed / 1000;
        
        // Phase 1: Animation de progression (durée variable selon le pourcentage)
        if (elapsedSeconds <= animationDuration) {
          const progressRatio = elapsedSeconds / animationDuration;
          // Animation fluide de 0.00% au pourcentage cible
          animatedProgress = progressRatio * targetProgress;
          // Les jours restent constants pendant l'animation
          animatedDays = targetDaysRemaining;
        }
        // Phase 2: Affichage statique des valeurs finales
        else {
          animatedProgress = targetProgress;
          animatedDays = targetDaysRemaining;
        }
        
        // Fond dégradé
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#2D3748');
        gradient.addColorStop(0.5, '#4A5568');
        gradient.addColorStop(1, '#718096');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Texte principal (tailles ajustées pour Full HD)
        ctx.fillStyle = 'white';
        ctx.font = 'bold 72px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('L\'année scolaire', canvas.width / 2, 450);
        ctx.fillText('est complète à', canvas.width / 2, 540);
        
        // Pourcentage en jaune (animé)
        ctx.fillStyle = '#F6E05E';
        ctx.font = 'bold 96px system-ui';
        ctx.fillText(`${animatedProgress.toFixed(2)}%`, canvas.width / 2, 660);

        // Barre de progression (dimensions ajustées pour Full HD)
        const barWidth = 840;
        const barHeight = 60;
        const barX = (canvas.width - barWidth) / 2;
        const barY = 840;
        
        // Fond de la barre
        ctx.fillStyle = '#374151';
        ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        // Remplissage de la barre (animé)
        ctx.fillStyle = 'white';
        const fillWidth = (barWidth * animatedProgress) / 100;
        ctx.fillRect(barX, barY, fillWidth, barHeight);

        // Texte du compte à rebours (tailles ajustées pour Full HD)
        ctx.fillStyle = 'white';
        ctx.font = '60px system-ui';
        ctx.fillText('Encore', canvas.width / 2, 1140);
        
        ctx.fillStyle = '#F6E05E';
        ctx.font = 'bold 84px system-ui';
        ctx.fillText(`${Math.round(animatedDays)}`, canvas.width / 2, 1260);
        
        ctx.fillStyle = 'white';
        ctx.font = '60px system-ui';
        ctx.fillText('jours avant les vacances !', canvas.width / 2, 1350);
      };

      // Capturer le stream du canvas avec framerate optimisé pour mobile
      const stream = canvas.captureStream(30); // 30 FPS pour une meilleure compatibilité mobile
      
      // Configuration optimisée pour TikTok - priorité au MP4 avec H.264
      let mimeType = 'video/mp4;codecs=avc1.42E01E'; // H.264 Baseline Profile
      let mediaRecorderOptions: MediaRecorderOptions = {
        mimeType: mimeType,
        videoBitsPerSecond: 8000000, // 8 Mbps - optimal pour TikTok Full HD
      };
      
      // Fallback vers WebM seulement si MP4 n'est pas supporté
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4'; // MP4 générique
        mediaRecorderOptions = {
          mimeType: mimeType,
          videoBitsPerSecond: 8000000,
        };
        
        // Si même MP4 générique ne marche pas, utiliser WebM en dernier recours
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm;codecs=vp8'; // VP8 plus compatible que VP9
          mediaRecorderOptions = {
            mimeType: mimeType,
            videoBitsPerSecond: 6000000, // Bitrate plus bas pour WebM
          };
        }
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, mediaRecorderOptions);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        // Télécharger la vidéo avec nom optimisé pour TikTok
        const a = document.createElement('a');
        a.href = url;
        const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        a.download = `tiktok-school-progress-${timestamp}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setIsRecording(false);
      };

      // Configuration d'enregistrement optimisée pour la stabilité
      mediaRecorderRef.current.start(1000); // Enregistrer par chunks de 1 seconde pour plus de stabilité

      // Animer et enregistrer avec timing optimisé
      const animationInterval = setInterval(drawFrame, 33); // ~30 FPS pour correspondre au stream
      
      setTimeout(() => {
        clearInterval(animationInterval);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, totalVideoDuration * 1000); // Convertir en millisecondes

    } catch (error) {
      console.error('Erreur lors de la capture vidéo:', error);
      setIsRecording(false);
    }
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <button 
        onClick={startVideoCapture}
        disabled={isRecording}
        style={buttonStyle}
        title={isRecording ? 'Enregistrement en cours...' : 'Télécharger une vidéo (T)'}
      >
        {isRecording ? '●' : 'T'}
      </button>
      <div style={contentStyle}>
        <h1 style={titleStyle}>
          L'année scolaire est complète à{' '}
          <span style={yellowTextStyle}>{progress.toFixed(2)}%</span>
        </h1>
        
        <div style={progressContainerStyle}>
          <div style={progressBarBgStyle}>
            <div style={progressBarFillStyle}></div>
          </div>
        </div>
        
        <p style={countdownStyle}>
          Encore{' '}
          <span style={yellowTextStyle}>{daysRemaining}</span>
          {' '}jours avant les vacances !
        </p>
      </div>
    </div>
  );
};

export default SchoolProgressTracker;