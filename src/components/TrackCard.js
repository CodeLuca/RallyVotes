import { Card, H4, Paragraph, XStack, Image, Button } from 'tamagui';
import Waveform from "../../assets/waveform.png"

export const TrackCard = () => {
  return (
    <Card style={{ width: "100%" }}
      animation="bouncy"
      scale={0.9}
      hoverStyle={{ scale: 0.925 }}
      pressStyle={{ scale: 0.875 }}>

      <Card.Header padded>
        <H4>Higher Than Ever Before</H4>
        <Paragraph theme="alt2">Disclosure</Paragraph>
      </Card.Header>
      <Image
        style={{ width: "100%", height: 30 }}
        source={Waveform}
      />
      <Card.Footer padded>
        <XStack flex={1} />
        <Button borderRadius="$10">1 RLY</Button>
      </Card.Footer>
    </Card>
  )
};
